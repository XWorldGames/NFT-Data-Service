import Sharp from 'sharp'
import { Service } from 'typedi'

export enum Param {
  Width = 'w',
  Height = 'h',
  Mode = 'm',
  Limit = 'l',
  Proportional = 'p',
  Quality = 'q',
  Progressive = 'r',
}

export enum Format {
  JPG = 'jpg',
  JPEG = 'jpeg',
  WEBP = 'webp',
  PNG = 'png',
  // GIF = 'gif',
}

export interface IImageResizingOptions {
  format?: string
  params: IImageResizingParams
}

export type IImageResizingParams = {
  [k in Param]?: number
}

@Service()
export class ImageResizingProcessor {
  private normalizeParams(params: IImageResizingParams): IImageResizingParams {
    return {
      w: params.w || 0,
      h: params.h || 0,
      m: params.m || 0,
      l: params.l || 0,
      p: params.p || 100,
      q: params.q || 80,
      r: params.r || 0,
    }
  }

  private applyResize(sharp: Sharp.Sharp, params: IImageResizingParams, originImageMeta: Sharp.Metadata) {
    let resizeOption: any = {
      width: null,
      height: null,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    }

    if (params.w && params.h) {
      if (params.m === 0) {
        if (originImageMeta.width > originImageMeta.height) {
          params.h = 0
        } else {
          params.w = 0
        }
      } else if (params.m === 1) {
        if (originImageMeta.width > originImageMeta.height) {
          params.w = 0
        } else {
          params.h = 0
        }
      } else if (params.m === 2) {
        resizeOption.fit = 'fill'
      }
      resizeOption.width = params.w || null
      resizeOption.height = params.h || null
    } else {
      if (params.w) {
        resizeOption = { width: params.w }
      }
      if (params.h) {
        resizeOption = { height: params.h }
      }
    }

    if (params.p !== 100) {
      if (resizeOption.width) {
        resizeOption.width = Math.floor((resizeOption.width * params.p) / 100)
      }
      if (resizeOption.height) {
        resizeOption.height = Math.floor((resizeOption.height * params.p) / 100)
      }
      if (!resizeOption.width && !resizeOption.height) {
        resizeOption.width = Math.floor((originImageMeta.width * params.p) / 100)
        resizeOption.height = Math.floor((originImageMeta.height * params.p) / 100)
      }
    }

    if (params.l === 1 && resizeOption.width && resizeOption.height) {
      if (resizeOption.width * resizeOption.height > originImageMeta.height * originImageMeta.width) {
        resizeOption = {}
      }
    }

    if (resizeOption.width && resizeOption.height) {
      if (resizeOption.width * resizeOption.height > 4096 * 4096) {
        resizeOption = {}
      }
    } else if (resizeOption.width > 4096 * 4) {
      resizeOption = {}
    } else if (resizeOption.height > 4096 * 4) {
      resizeOption = {}
    }

    if (resizeOption.width || resizeOption.height) {
      sharp.resize(resizeOption).withMetadata()
    }
  }

  private applyFormat(sharp, format, params) {
    const formatOption: any = { quality: params.q }
    format = format.replace('image/', '')
    if (format === Format.JPG && params.r === 1) {
      formatOption.progressive = true
      formatOption.chromaSubsampling = '4:2:0'
    }
    sharp.toFormat(format, formatOption)
  }

  async resize(buffer, { format, params }: IImageResizingOptions) {
    params = this.normalizeParams(params)
    const sharp = Sharp(buffer, { failOnError: false })
    const originImageMeta = await sharp.metadata()
    this.applyResize(sharp, params, originImageMeta)
    this.applyFormat(sharp, format, params)
    return await sharp.toBuffer()
  }
}
