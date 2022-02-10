import { HttpNotFoundException } from '@exceptions/http-not-found.exception'
import { MetadataService } from '@services/metadata.service'
import config from 'config'
import { Controller, Get, Param } from 'routing-controllers'
import { Container, Service } from 'typedi'

@Controller()
@Service()
export class MetadataController {
  protected readonly metadataService: MetadataService

  private readonly imageUrlTemplate: { [k: string]: string }

  constructor() {
    this.metadataService = Container.get(MetadataService)
    this.imageUrlTemplate = config.get(`image.url`)
  }

  @Get('/:collectionId([0-9]+)/:tokenId([0-9]+)')
  async get(@Param('collectionId') collectionId: number, @Param('tokenId') tokenId: number): Promise<any> {
    const metadata = await this.metadataService.findByTokenId(collectionId, tokenId)
    if (metadata) {
      const data = metadata.value
      const imageUrl = this.imageUrlTemplate[collectionId].replace('{collectionId}', `${collectionId}`).replace('{tokenId}', `${tokenId}`)
      return {
        name: data.name,
        description: data.description,
        image: `${imageUrl}?${metadata.hash}`,
        external_url: 'https://xwg.games/',
        properties: data['properties'] ?? {},
      }
    }
    throw new HttpNotFoundException()
  }
}
