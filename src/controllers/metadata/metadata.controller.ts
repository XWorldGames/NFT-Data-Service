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

  @Get('/:collectionId([0-9]+)/{id}:tokenId([0-9]+|[0-9a-f]{64})')
  @Get('/:collectionId([0-9]+)/%7Bid%7D:tokenId([0-9]+|[0-9a-f]{64})')
  @Get('/:collectionId([0-9]+)/:tokenId([0-9]+|[0-9a-f]{64})')
  async get(@Param('collectionId') collectionId: number, @Param('tokenId') tokenId: string): Promise<any> {
    // const id = Number(tokenId.length === 64 ? `0x${tokenId}` : tokenId)
    const id = tokenId;
    const metadata = await this.metadataService.findByTokenId(collectionId, id)
    console.log(metadata)
    if (metadata) {
      const data = metadata.value
      const imageUrl = this.imageUrlTemplate[collectionId].replace('{collectionId}', `${collectionId}`).replace('{tokenId}', `${id}`)
      const result = {
        name: data.name,
        description: data.description,
        image: `${imageUrl}?${metadata.hash}`,
        external_url: 'https://xwg.games/',
        attributes: [],
      }

      if (data['properties']) {
        if (data['properties']['media_url']) {
          result['animation_url'] = data['properties']['media_url']
        }
        result.attributes = this.metadataService.transformAttributes(collectionId, data['properties'])
      }

      return result
    }
    throw new HttpNotFoundException()
  }
}
