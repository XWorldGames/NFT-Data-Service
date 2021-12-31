import { ImageResizingParam } from '@/decorators/image-resizing-param.decorator'
import { KnownHashParam } from '@/decorators/known-hash-param.decorator'
import { IHashedImageEntity } from '@/entities/hashed-image.entity'
import { NotModifiedResponse } from '@/http/not-modified.response'
import { IImageResizingOptions } from '@/image-processors/image-resizing-processor'
import { AbstractImageController } from '@controllers/abstract.image.controller'
import { HttpNotFoundException } from '@exceptions/http-not-found.exception'
import { Controller, Get, Param } from 'routing-controllers'
import { Service } from 'typedi'

@Controller()
@Service()
export class TokenController extends AbstractImageController {
  @Get('/tokens/:collectionId([0-9]+)/:tokenId([0-9]+):resizing([.@][.0-9a-z_]+)?')
  async get(
    @Param('collectionId') collectionId: number,
    @Param('tokenId') tokenId: number,
    @ImageResizingParam('resizing') resizingOptions?: IImageResizingOptions,
    @KnownHashParam() knownHash?: string,
  ): Promise<IHashedImageEntity | NotModifiedResponse> {
    const image = await this.imageService.findTokenImage(collectionId, tokenId, resizingOptions, knownHash)
    if (image) {
      return image === true ? new NotModifiedResponse(knownHash) : image
    }
    throw new HttpNotFoundException()
  }
}
