import { ImageResizingParam } from '@/decorators/image-resizing-param.decorator'
import { KnownHashParam } from '@/decorators/known-hash-param.decorator'
import { IHashedImageEntity } from '@/entities/hashed-image.entity'
import { NotModifiedResponse } from '@/http/not-modified.response'
import { IImageResizingOptions } from '@/image-processors/image-resizing-processor'
import { AbstractAssetController, routePrefix } from '@controllers/abstract.asset.controller'
import { HttpNotFoundException } from '@exceptions/http-not-found.exception'
import { Controller, Get, Param } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

@Controller(`/${routePrefix}/${id}`)
@Service()
export class AssetController extends AbstractAssetController {
  @Inject()
  private readonly dataRepository: DataRepository

  @Get('/tokens/:gearId([0-9]{8})/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageById(
    @Param('gearId') gearId: number,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const gear = this.dataRepository.findGearById(gearId)
    return this.getMockTokenImage(gear, grade, resizingOptions, knownHash)
  }

  @Get('/tokens/:gearCode([0-9]{1,7})/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageByCode(
    @Param('gearCode') gearCode: string,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const gear = this.dataRepository.findGearByCode(gearCode)
    return this.getMockTokenImage(gear, grade, resizingOptions, knownHash)
  }

  @Get('/tokens/:class([0-9]+)-:classGearId([0-9]+)/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageByClassAndClassGearId(
    @Param('class') characterClass: number,
    @Param('classGearId') classGearId: number,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const gear = this.dataRepository.findGearByTokenClassAndClassGearId(characterClass, classGearId)
    return this.getMockTokenImage(gear, grade, resizingOptions, knownHash)
  }

  @Get('/gears/icons/:gearId([0-9]{8}):resizing([.@][.0-9a-z_]+)?')
  async getGearAssetById(
    @Param('gearId') gearId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const gear = this.dataRepository.findGearById(gearId)
    return this.getGearAsset(gear, resizingOptions, knownHash)
  }

  @Get('/gears/icons/:gearCode([0-9]{1,7}):resizing([.@][.0-9a-z_]+)?')
  async getGearAssetByCode(
    @Param('gearCode') gearCode: string,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const gear = this.dataRepository.findGearByCode(gearCode)
    return this.getGearAsset(gear, resizingOptions, knownHash)
  }

  @Get('/gears/icons/:class([0-9]+)-:classGearId([0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getGearAssetByClassAndClassGearId(
    @Param('class') characterClass: number,
    @Param('classGearId') classGearId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const gear = this.dataRepository.findGearByTokenClassAndClassGearId(characterClass, classGearId)
    return this.getGearAsset(gear, resizingOptions, knownHash)
  }

  private async getMockTokenImage(
    gear,
    grade,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!gear) {
      throw new HttpNotFoundException()
    }
    const image = await this.imageService.findMockTokenImage(id, gear.id, { grade }, resizingOptions, knownHash)
    if (image) {
      return image === true ? new NotModifiedResponse(knownHash) : image
    }
    throw new HttpNotFoundException()
  }

  private async getGearAsset(
    gear,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!gear) {
      throw new HttpNotFoundException()
    }
    return this.findAssetImage(`icons/${gear.id}.png`, resizingOptions, knownHash)
  }

  private async findAssetImage(
    path: string,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const image = await this.imageService.findAssetImage(id, path, resizingOptions, knownHash)
    if (image) {
      return image === true ? new NotModifiedResponse(knownHash) : image
    }
    throw new HttpNotFoundException()
  }
}
