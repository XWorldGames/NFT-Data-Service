import { IImageEntity, ImageEntity } from '@/entities/image.entity'
import { DataRepository } from '@/repositories/data.repository'
import {
  IImageCompositionElement,
  IImageCompositionElementPosition,
  IImageCompositionElementSet,
  IImageCompositionFitMode,
  IImageCompositionOriginOffset,
  IImageCompositionResource,
  IImageCompositionResourceCompositionDirection,
  IImageCompositionResourceMultiple,
  IImageCompositionResourceValueMap,
  IImageCompositionRule,
  IImageCompositionRuleAnimation,
  IImageCompositionRuleLayers,
} from '@interfaces/image-composition-configuration.interface'
import { ITokenMetadata } from '@interfaces/token-metadata.interface'
import { glob } from '@utils/filesystem'
import { getObjectValue, isEmpty } from '@utils/util'
import Canvas from 'canvas'
import fs from 'fs/promises'
import GIFEncoder from 'gifencoder'
import sharp, { OutputInfo, Sharp } from 'sharp'
import { Inject, Service } from 'typedi'

type ObjectiveBuffer = { data: Buffer; info: OutputInfo }

type ResizingOption = {
  width?: number | null
  height?: number | null
  fit?: IImageCompositionFitMode | null
}

type Coordinate = {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface ResolvedElement {
  width: number
  height: number
  position?: IImageCompositionElementPosition | null
  coordinate?: Coordinate
  resources: ObjectiveBuffer[]
}

type ResolvedElementSet = { [k: string]: ResolvedElement }

@Service()
export class TokenImageGenerationProcessor {
  @Inject()
  private readonly dataRepository: DataRepository

  private cache: { [k: string]: ObjectiveBuffer } = {}

  async generate(collectionId: number, metadata: ITokenMetadata): Promise<IImageEntity> {
    const { width, height, rules, elements } = this.dataRepository.getImageCompositionConfiguration(collectionId)
    if (metadata.special) {
      return await this.make(width, height, rules.special, elements, metadata)
    }
    return await this.make(width, height, rules.default, elements, metadata)
  }

  private async resolveSize(sharp: Sharp, width?: number | null, height?: number | null, fit?: IImageCompositionFitMode | null): Promise<Sharp> {
    const metadata = await sharp.metadata()
    const options = {}
    if (width) {
      options['width'] = width
      if (!height) {
        options['height'] = metadata.height
      }
    }
    if (height) {
      options['height'] = height
      if (!width) {
        options['width'] = metadata.width
      }
    }
    if (fit) {
      options['fit'] = fit
    }
    if (Object.keys(options).length !== 0) {
      options['background'] = { r: 255, g: 255, b: 255, alpha: 0 }
      sharp.resize(options)
    }
    return sharp
  }

  private async getAsset(path: string, resizingOption?: ResizingOption): Promise<ObjectiveBuffer> {
    const { width, height, fit } = resizingOption || {}
    const key = `${path}.${width}.${height}.${fit}`
    if (!(path in this.cache)) {
      this.cache[key] = await (await this.resolveSize(sharp(await fs.readFile(path)), width, height, fit)).toBuffer({ resolveWithObject: true })
    }
    return this.cache[key]
  }

  private async resolveAsset(path, resizingOption?: ResizingOption): Promise<ObjectiveBuffer> {
    return this.getAsset(path, resizingOption)
  }

  private async resolveCompositionAsset(
    assets: ObjectiveBuffer[],
    direction?: IImageCompositionResourceCompositionDirection | null,
    gap?: number | null,
  ): Promise<ObjectiveBuffer> {
    let fixedPositionName: 'top' | 'left'
    let dynamicPositionName: 'top' | 'left'
    let fixedSizeProp: 'width' | 'height'
    let dynamicSizeProp: 'width' | 'height'
    switch (direction) {
      default:
      case 0:
      case 1:
        fixedPositionName = 'top'
        dynamicPositionName = 'left'
        fixedSizeProp = 'height'
        dynamicSizeProp = 'width'
        break
      case 2:
      case 3:
        fixedPositionName = 'left'
        dynamicPositionName = 'top'
        fixedSizeProp = 'width'
        dynamicSizeProp = 'height'
        break
    }

    if (direction === 1 || direction === 3) {
      assets = assets.reverse()
    }

    if (!gap) {
      gap = 0
    }

    const images = []
    const fixedPositionValue = 0
    let dynamicPositionValue = 0
    let fixedSizeValue = 0
    for (const { data, info } of assets) {
      images.push({ input: data, [fixedPositionName]: fixedPositionValue, [dynamicPositionName]: dynamicPositionValue })
      dynamicPositionValue += info[dynamicSizeProp] + gap
      if (info[fixedSizeProp] > fixedSizeValue) {
        fixedSizeValue = info[fixedSizeProp]
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await sharp({
      create: {
        [fixedSizeProp]: fixedSizeValue,
        [dynamicSizeProp]: dynamicPositionValue - gap,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(images)
      .png()
      .toBuffer({ resolveWithObject: true })
  }

  private async resolveCompositionMode1Resource(
    path: string,
    repeatCount: number,
    direction?: IImageCompositionResourceCompositionDirection | null,
    gap?: number | null,
    resizingOption?: ResizingOption,
  ) {
    return this.resolveCompositionAsset(Array(repeatCount).fill(await this.getAsset(path, resizingOption)), direction, gap)
  }

  private async resolveCompositionMode2Resource(
    paths: string[],
    direction?: IImageCompositionResourceCompositionDirection | null,
    gap?: number | null,
    resizingOption?: ResizingOption,
  ): Promise<ObjectiveBuffer> {
    const assets = []
    for (const path of paths) {
      assets.push(await this.getAsset(path, resizingOption))
    }
    return this.resolveCompositionAsset(assets, direction, gap)
  }

  private resolvePathTemplate(path, valueMap) {
    for (const k in valueMap) {
      path = path.replace(`{${k}}`, String(valueMap[k]))
    }
    return path
  }

  private async resolveResourceFile(
    path: string,
    valueMap: IImageCompositionResourceValueMap,
    multiple?: IImageCompositionResourceMultiple | null,
    direction?: IImageCompositionResourceCompositionDirection | null,
    gap?: number | null,
    resizingOption?: ResizingOption,
  ): Promise<ObjectiveBuffer> {
    let buffer

    if (multiple) {
      const { uses, mode } = multiple
      switch (mode) {
        case 0:
          buffer = await this.resolveCompositionMode1Resource(path, Number(valueMap[uses]), direction, gap, resizingOption)
          break
        case 1:
          buffer = await this.resolveCompositionMode2Resource(
            String(valueMap[uses])
              .split('')
              .map(char => path.replace('{#}', char.charCodeAt(0).toString())),
            direction,
            gap,
            resizingOption,
          )
          break
      }
    } else {
      buffer = await this.resolveAsset(path, resizingOption)
    }

    if (isEmpty(buffer)) {
      throw new Error('')
    }

    return buffer
  }

  private async resolveResource(
    { width, height, fit, value, composition, path, framesPath }: IImageCompositionResource,
    metadata: ITokenMetadata,
    animationOptions?: IImageCompositionRuleAnimation | null,
  ): Promise<ObjectiveBuffer[]> {
    const { direction, gap } = composition || {}
    const { content, multiple } = value || {}
    const valueMap = {}
    if (typeof content === 'object') {
      for (const k in content) {
        valueMap[k] = getObjectValue(metadata, content[k])
      }
    }
    const resizingOption = { width, height, fit }
    const resources = []

    if (metadata.animated && framesPath) {
      const paths = await glob(this.resolvePathTemplate(framesPath, valueMap))
      const n = (animationOptions ? animationOptions.extractFrames : 0) + 1
      for (let i = 0, m = paths.length; i < m; i += n) {
        resources.push(await this.resolveResourceFile(paths[i], valueMap, multiple, direction, gap, resizingOption))
      }
    } else {
      resources.push(await this.resolveResourceFile(this.resolvePathTemplate(path, valueMap), valueMap, multiple, direction, gap, resizingOption))
    }

    return resources
  }

  private async resolveElement(element: IImageCompositionElement, metadata: ITokenMetadata): Promise<ResolvedElement> {
    const { width, height, fit, position, resource } = element
    const resources = await this.resolveResource(resource, metadata, 'animation' in element ? element['animation'] : null)
    let w = 0
    let h = 0
    for (let i = 0, m = resources.length; i < m; ++i) {
      if (width || height) {
        resources[i] = await (await this.resolveSize(sharp(resources[i].data), width, height, fit)).toBuffer({ resolveWithObject: true })
      }
      const { info } = resources[i]
      if (w < info.width) {
        w = info.width
      }
      if (h < info.height) {
        h = info.height
      }
    }
    return {
      width: w,
      height: h,
      position,
      resources,
    }
  }

  private calculateOriginOffset(offset: IImageCompositionOriginOffset, value: number): number {
    if (typeof offset === 'string') {
      let percentage
      switch (offset) {
        case 'start':
          percentage = 0
          break
        case 'center':
          percentage = 0.5
          break
        case 'end':
          percentage = 1
          break
        default:
          percentage = parseFloat(offset)
          if (isNaN(percentage)) {
            percentage = 0
          } else if (/%$/.test(offset)) {
            percentage /= 100
          } else {
            return percentage + value
          }
          break
      }
      return percentage * value
    } else if (typeof offset === 'number') {
      return offset + value
    }
    return 0
  }

  private calculateDistance(
    length: number,
    offset: number,
    originOffset: IImageCompositionOriginOffset,
    referenceDistanceStart: number,
    referenceDistanceEnd: number,
    referenceOriginOffset: IImageCompositionOriginOffset,
    reverse: boolean,
  ): [number, number] {
    const originOffsetValue = this.calculateOriginOffset(originOffset, length)
    const referenceOriginDistance =
      this.calculateOriginOffset(referenceOriginOffset, referenceDistanceEnd - referenceDistanceStart) + referenceDistanceStart
    const start = Math.floor(referenceOriginDistance + (reverse ? -offset : offset) - originOffsetValue)
    return [start, start + length]
  }

  private resolveLElementCoordinate(width: number, height: number, resolvedElement: ResolvedElement, elements: ResolvedElementSet): ResolvedElement {
    if (resolvedElement.coordinate) {
      return resolvedElement
    }
    const { width: elementWidth, height: elementHeight, position } = resolvedElement
    const { top, right, bottom, left, origin, reference } = position || {}
    const coordinate: Coordinate = { x1: 0, y1: 0, x2: 0, y2: 0 }

    if (top === null && right === null && bottom === null && left === null) {
      if (width !== elementWidth) {
        coordinate.x1 = Math.floor((width - elementWidth) / 2)
        coordinate.x2 = coordinate.x1 + elementWidth
      }
      if (height !== elementHeight) {
        coordinate.y1 = Math.floor((height - elementHeight) / 2)
        coordinate.y2 = coordinate.y1 + elementHeight
      }
    } else {
      const [horizontal, vertical] = origin || []
      let referenceCoordinate: Coordinate
      const { name: referenceName, origin: referenceOrigin } = reference || {}
      if (referenceName) {
        referenceCoordinate = this.resolveLElementCoordinate(width, height, elements[referenceName], elements).coordinate
      } else {
        referenceCoordinate = { x1: 0, y1: 0, x2: width, y2: height }
      }
      const referenceOriginMap = referenceOrigin || {}
      if (!isEmpty(top)) {
        const [start, end] = this.calculateDistance(
          elementHeight,
          top,
          vertical || 'start',
          referenceCoordinate.y1,
          referenceCoordinate.y2,
          referenceOriginMap.top || 'start',
          false,
        )
        coordinate.y1 = start
        coordinate.y2 = end
      } else if (!isEmpty(bottom)) {
        const [start, end] = this.calculateDistance(
          elementHeight,
          bottom,
          vertical || 'end',
          referenceCoordinate.y1,
          referenceCoordinate.y2,
          referenceOriginMap.bottom || 'end',
          true,
        )
        coordinate.y1 = start
        coordinate.y2 = end
      } else {
        coordinate.y1 = referenceCoordinate.y1
        coordinate.y2 = coordinate.y1 + elementHeight
      }
      if (!isEmpty(left)) {
        const [start, end] = this.calculateDistance(
          elementWidth,
          left,
          horizontal || 'start',
          referenceCoordinate.x1,
          referenceCoordinate.x2,
          referenceOriginMap.left || 'start',
          false,
        )
        coordinate.x1 = start
        coordinate.x2 = end
      } else if (!isEmpty(right)) {
        const [start, end] = this.calculateDistance(
          elementWidth,
          right,
          horizontal || 'end',
          referenceCoordinate.x1,
          referenceCoordinate.x2,
          referenceOriginMap.right || 'end',
          true,
        )
        coordinate.x1 = start
        coordinate.x2 = end
      } else {
        coordinate.x1 = referenceCoordinate.x1
        coordinate.x2 = coordinate.x1 + elementWidth
      }
    }
    resolvedElement.coordinate = coordinate
    return resolvedElement
  }

  private async resolveLayers(
    width: number,
    height: number,
    layers: IImageCompositionRuleLayers,
    elements: IImageCompositionElementSet,
    metadata: ITokenMetadata,
    eventElementName: string,
  ): Promise<ResolvedElementSet> {
    const resolved: ResolvedElementSet = {}
    for (const k of layers) {
      if (elements[k].when && !elements[k].when(metadata)) {
        continue
      }
      if (!metadata.event && k === eventElementName) {
        continue
      }
      resolved[k] = await this.resolveElement(elements[k], metadata)
    }

    for (const k in resolved) {
      this.resolveLElementCoordinate(width, height, resolved[k], resolved).coordinate
    }

    return resolved
  }

  private async compositeLayers(
    width: number,
    height: number,
    resolvedElements: ResolvedElementSet,
    mainElementName: string = null,
    mainElementResourceIndex = 0,
  ): Promise<Buffer> {
    const images = []
    for (const [name, resolvedElement] of Object.entries(resolvedElements)) {
      images.push({
        input: resolvedElement.resources[name === mainElementName ? mainElementResourceIndex : 0].data,
        top: resolvedElement.coordinate.y1,
        left: resolvedElement.coordinate.x1,
      })
    }
    return await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(images)
      .png()
      .toBuffer()
  }

  private async makeGif(width, height, frames: Buffer[], options: IImageCompositionRuleAnimation): Promise<Buffer> {
    const canvas = Canvas.createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const encoder = new GIFEncoder(width, height)
    encoder.start()
    encoder.setRepeat(0)
    encoder.setDelay(options.delay)
    encoder.setQuality(options.quality)
    for (const frame of frames) {
      ctx.drawImage(await Canvas.loadImage(frame), 0, 0, canvas.width, canvas.height)
      encoder.addFrame(ctx)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    encoder.finish()
    return encoder.out.getData()
  }

  private async make(
    width: number,
    height: number,
    rule: IImageCompositionRule,
    elements: IImageCompositionElementSet,
    metadata: ITokenMetadata,
  ): Promise<IImageEntity> {
    const { layers, mainElementName, eventElementName, animation } = rule
    if (metadata.animated && animation) {
      elements[mainElementName]['animation'] = animation
    }
    const resolvedElements = await this.resolveLayers(width, height, layers, elements, metadata, eventElementName)
    if (metadata.animated && animation) {
      const compositedImages = []
      for (let i = 0, m = resolvedElements[mainElementName].resources.length; i < m; ++i) {
        compositedImages.push(await this.compositeLayers(width, height, resolvedElements, mainElementName, i))
      }
      return new ImageEntity('image/gif', await this.makeGif(width, height, compositedImages, animation))
    }
    return new ImageEntity('image/png', await this.compositeLayers(width, height, resolvedElements))
  }
}
