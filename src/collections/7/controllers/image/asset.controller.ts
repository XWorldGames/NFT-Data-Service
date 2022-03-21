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

  @Get('/tokens/:talentId([0-9]{8})/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageById(
    @Param('talentId') talentId: number,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const talent = this.dataRepository.findTalentById(talentId)
    return this.getMockTokenImage(talent, grade, resizingOptions, knownHash)
  }

  @Get('/tokens/:talentCode([0-9]{1,7})/:grade([1-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageByCode(
    @Param('talentCode') talentCode: string,
    @Param('grade') grade: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const talent = this.dataRepository.findTalentByCode(talentCode)
    return this.getMockTokenImage(talent, grade, resizingOptions, knownHash)
  }

  @Get('/talents/icons/:talentId([0-9]{8}):resizing([.@][.0-9a-z_]+)?')
  async getTalentAssetById(
    @Param('talentId') talentId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const talent = this.dataRepository.findTalentById(talentId)
    return this.getTalentAsset(talent, resizingOptions, knownHash)
  }

  @Get('/talents/icons/:talentCode([0-9]{1,7}):resizing([.@][.0-9a-z_]+)?')
  async getTalentAssetByCode(
    @Param('talentCode') talentCode: string,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const talent = this.dataRepository.findTalentByCode(talentCode)
    return this.getTalentAsset(talent, resizingOptions, knownHash)
  }

  private async getMockTokenImage(
    talent,
    grade,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!talent) {
      throw new HttpNotFoundException()
    }
    const image = await this.imageService.findMockTokenImage(id, talent.id, { grade }, resizingOptions, knownHash)
    if (image) {
      return image === true ? new NotModifiedResponse(knownHash) : image
    }
    throw new HttpNotFoundException()
  }

  private async getTalentAsset(
    talent,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!talent) {
      throw new HttpNotFoundException()
    }
    return this.findAssetImage(`icons/${talent.id}.png`, resizingOptions, knownHash)
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
