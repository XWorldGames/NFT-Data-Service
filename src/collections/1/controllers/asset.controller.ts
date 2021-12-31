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

  @Get('/tokens/:characterId([0-9]+)/:grade([1-5])-:element([0-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageById(
    @Param('characterId') characterId: number,
    @Param('grade') grade: number,
    @Param('element') element: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const character = this.dataRepository.findCharacterById(characterId)
    return this.getMockTokenImage(character, grade, element, resizingOptions, knownHash)
  }

  @Get('/tokens/:characterCode(COL[0-9]+)/:grade([1-5])-:element([0-5]):resizing([.@][.0-9a-z_]+)?')
  async getMockTokenImageByCode(
    @Param('characterCode') characterCode: string,
    @Param('grade') grade: number,
    @Param('element') element: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const character = this.dataRepository.findCharacterByCode(characterCode)
    return this.getMockTokenImage(character, grade, element, resizingOptions, knownHash)
  }

  @Get('/characters/paintings/:characterId([0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getCharacterAssetById(
    @Param('characterId') characterId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const character = this.dataRepository.findCharacterById(characterId)
    return this.getCharacterAsset(character, resizingOptions, knownHash)
  }

  @Get('/characters/paintings/:characterCode(COL[0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getCharacterAssetByCode(
    @Param('characterCode') characterCode: string,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const character = this.dataRepository.findCharacterByCode(characterCode)
    return this.getCharacterAsset(character, resizingOptions, knownHash)
  }

  @Get('/characters/avatars/:characterId([0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getCharacterAvatarAssetById(
    @Param('characterId') characterId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const character = this.dataRepository.findCharacterById(characterId)
    return this.getCharacterAvatarAsset(character, resizingOptions, knownHash)
  }

  @Get('/characters/avatars/:characterCode(COL[0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getCharacterAvatarAssetByCode(
    @Param('characterCode') characterCode: string,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const character = this.dataRepository.findCharacterByCode(characterCode)
    return this.getCharacterAvatarAsset(character, resizingOptions, knownHash)
  }

  @Get('/skills/icons/:skillId([0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getSkillAssetById(
    @Param('skillId') skillId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const skill = this.dataRepository.findSkillById(skillId)
    return this.getSkillAsset(skill, resizingOptions, knownHash)
  }

  @Get('/skills/icons/1/:skillCode(SKL[0-9]+):resizing([.@][.0-9a-z_]+)?')
  async getVersion1SkillAssetByCode(
    @Param('skillCode') skillCode: string,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const skill = this.dataRepository.findVersion1SkillByCode(skillCode)
    return this.getSkillAsset(skill, resizingOptions, knownHash)
  }

  private async getMockTokenImage(
    character,
    grade,
    element,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!character) {
      throw new HttpNotFoundException()
    }
    const image = await this.imageService.findMockTokenImage(id, character.id, { grade, element }, resizingOptions, knownHash)
    if (image) {
      return image === true ? new NotModifiedResponse(knownHash) : image
    }
    throw new HttpNotFoundException()
  }

  private async getCharacterAsset(
    character,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!character) {
      throw new HttpNotFoundException()
    }
    return await this.findAssetImage(`characters/full/${character.id}.png`, resizingOptions, knownHash)
  }

  private async getCharacterAvatarAsset(
    character,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!character) {
      throw new HttpNotFoundException()
    }
    return await this.findAssetImage(`characters/avatar/${character.id}.png`, resizingOptions, knownHash)
  }

  private async getSkillAsset(
    skill,
    resizingOptions: IImageResizingOptions | undefined,
    knownHash: string | undefined,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    if (!skill) {
      throw new HttpNotFoundException()
    }
    return await this.findAssetImage(`skills/${skill.version}/${skill.id}.jpg`, resizingOptions, knownHash)
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
