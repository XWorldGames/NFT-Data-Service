import { ImageResizingParam } from '@/decorators/image-resizing-param.decorator'
import { KnownHashParam } from '@/decorators/known-hash-param.decorator'
import { IHashedImageEntity } from '@/entities/hashed-image.entity'
import { NotModifiedResponse } from '@/http/not-modified.response'
import { IImageResizingOptions } from '@/image-processors/image-resizing-processor'
import { AbstractAssetController, routePrefix } from '@controllers/abstract.asset.controller'
import { HttpNotFoundException } from '@exceptions/http-not-found.exception'
import { Controller, Get, Param } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import id from '../../id'
import { DataRepository } from '../../repositories/data.repository'

@Controller(`/${routePrefix}/${id}`)
@Service()
export class AssetController extends AbstractAssetController {
  @Inject()
  private readonly dataRepository: DataRepository

  @Get('/tokens/:equipmentId([0-9]{8})/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageById(
    @Param('equipmentId') equipmentId: number,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const equipment = this.dataRepository.findEquipmentById(equipmentId)
    return this.getMockTokenImage(equipment, grade, resizingOptions, knownHash)
  }

  @Get('/tokens/:equipmentCode([0-9]{1,7})/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageByCode(
    @Param('equipmentCode') equipmentCode: string,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const equipment = this.dataRepository.findEquipmentByCode(equipmentCode)
    return this.getMockTokenImage(equipment, grade, resizingOptions, knownHash)
  }

  @Get('/tokens/:class([0-9]+)-:classEquipmentId([0-9]+)/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageByClassAndClassEquipmentId(
    @Param('class') characterClass: number,
    @Param('classEquipmentId') classEquipmentId: number,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const equipment = this.dataRepository.findEquipmentByTokenClassAndClassEquipmentId(characterClass, classEquipmentId)
    return this.getMockTokenImage(equipment, grade, resizingOptions, knownHash)
  }

  @Get('/equipments/icons/:equipmentId([0-9]{8}):resizing([.@][.0-9a-z_]+)?')
  async getEquipmentAssetById(
    @Param('equipmentId') equipmentId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const equipment = this.dataRepository.findEquipmentById(equipmentId)
    return this.getEquipmentAsset(equipment, resizingOptions, knownHash)
  }

  @Get('/equipments/icons/:equipmentCode([0-9]{1,7}):resizing([.@][.0-9a-z_]+)?')
  async getEquipmentAssetByCode(
    @Param('equipmentCode') equipmentCode: string,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const equipment = this.dataRepository.findEquipmentByCode(equipmentCode)
    return this.getEquipmentAsset(equipment, resizingOptions, knownHash)
  }

  @Get('/equipments/icons/:class([0-9]+)-:classEquipmentId([0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getEquipmentAssetByClassAndClassEquipmentId(
    @Param('class') characterClass: number,
    @Param('classEquipmentId') classEquipmentId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const equipment = this.dataRepository.findEquipmentByTokenClassAndClassEquipmentId(characterClass, classEquipmentId)
    return this.getEquipmentAsset(equipment, resizingOptions, knownHash)
  }

  private async getMockTokenImage(
    equipment,
    grade,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!equipment) {
      throw new HttpNotFoundException()
    }
    const image = await this.imageService.findMockTokenImage(id, equipment.id, { grade }, resizingOptions, knownHash)
    if (image) {
      return image === true ? new NotModifiedResponse(knownHash) : image
    }
    throw new HttpNotFoundException()
  }

  private async getEquipmentAsset(
    equipment,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!equipment) {
      throw new HttpNotFoundException()
    }
    return this.findAssetImage(`icons/${equipment.id}.png`, resizingOptions, knownHash)
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
