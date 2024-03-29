import { getMetadataNormalizers } from '@/collection'
import { IMetadataEntity, MetadataEntity } from '@/entities/metadata.entity'
import { TokenRepository } from '@/repositories/token.repository'
import { ITokenMetadataNormalizer } from '@interfaces/token-metadata.normalizer.interface'
import { DataRepository } from '@repositories/data.repository'
import { MetadataRepository } from '@repositories/metadata.repository'
import { logger } from '@utils/logger'
import objectHash from 'object-hash'
import { Container, Inject, Service } from 'typedi'

@Service()
export class MetadataService {
  @Inject()
  private readonly metadataRepository: MetadataRepository

  @Inject()
  private readonly tokenRepository: TokenRepository

  @Inject()
  private readonly dataRepository: DataRepository

  private readonly normalizers: { [k: string]: ITokenMetadataNormalizer }

  constructor() {
    const normalizers = {}
    Object.entries(getMetadataNormalizers()).forEach(([collectionId, normalizer]) => (normalizers[collectionId] = Container.get(normalizer)))
    this.normalizers = normalizers
  }

  transformAttributes(collectionId: number, properties: any) {
    return this.normalizers[collectionId].transformAttributes(properties)
  }

  async findByTokenId(collectionId: number, tokenId: string): Promise<IMetadataEntity | null> {
    const key = this.metadataRepository.resolveKey(collectionId, tokenId)
    let metadata = await this.metadataRepository.get(key)
    let token
    try {
      const data = await this.tokenRepository.get(collectionId, tokenId)
      console.log("findByTokenId data =" + data)
      if (data !== undefined && data !== null) {
        token = this.normalizers[collectionId].normalize(tokenId, data)
        console.log("findByTokenId token = " + token)
        if (token) {
          token['iccv'] = this.dataRepository.getImageCompositionConfiguration(collectionId).version
        }
      }
    } catch (error) {
      // console.log(error)
      if (error.code !== 'CALL_EXCEPTION') {
        logger.error(`[SERVICE] MetadataService.findByTokenId(${collectionId}, ${tokenId}), Message:: ${error.message}`)
        return metadata || null
      }
    }
    if (token) {
      const hash = objectHash(token)
      if (!metadata || hash !== metadata.hash) {
        metadata = new MetadataEntity(hash, token)
        await this.metadataRepository.put(key, metadata)
      }
    } else if (metadata) {
      metadata = null
      await this.metadataRepository.del(key)
    }

    return metadata
  }

  async getMockTokenByIdentifierWithGivenData(collectionId: number, identifier: number, mockData: any): Promise<IMetadataEntity> {
    const metadata = this.normalizers[collectionId].mock(identifier, mockData)
    const hash = objectHash(metadata)
    return new MetadataEntity(hash, metadata)
  }
}
