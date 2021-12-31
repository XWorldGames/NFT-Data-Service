import { getMetadataNormalizers } from '@/collection'
import { IMetadataEntity, MetadataEntity } from '@/entities/metadata.entity'
import { TokenRepository } from '@/repositories/token.repository'
import { ITokenMetadataNormalizer } from '@interfaces/token-metadata.normalizer.interface'
import { MetadataRepository } from '@repositories/metadata.repository'
import objectHash from 'object-hash'
import { Container, Inject, Service } from 'typedi'

@Service()
export class MetadataService {
  @Inject()
  private readonly metadataRepository: MetadataRepository

  @Inject()
  private readonly tokenRepository: TokenRepository

  private readonly normalizers: { [k: string]: ITokenMetadataNormalizer }

  constructor() {
    const normalizers = {}
    Object.entries(getMetadataNormalizers()).forEach(([collectionId, normalizer]) => (normalizers[collectionId] = Container.get(normalizer)))
    this.normalizers = normalizers
  }

  async findByTokenId(collectionId: number, tokenId: number): Promise<IMetadataEntity> {
    let metadata = await this.tokenRepository.get(collectionId, tokenId)
    metadata = this.normalizers[collectionId].normalize(tokenId, metadata)

    const key = this.metadataRepository.resolveKey(collectionId, tokenId)
    let data = await this.metadataRepository.get(key)

    if (metadata) {
      const hash = objectHash(metadata)
      if (!data || hash !== data.hash) {
        data = new MetadataEntity(hash, metadata)
        await this.metadataRepository.put(key, data)
      }
    }

    return data
  }

  async getMockTokenByIdentifierWithGivenData(collectionId: number, identifier: number, mockData: any): Promise<IMetadataEntity> {
    const metadata = this.normalizers[collectionId].mock(identifier, mockData)
    const hash = objectHash(metadata)
    return new MetadataEntity(hash, metadata)
  }
}
