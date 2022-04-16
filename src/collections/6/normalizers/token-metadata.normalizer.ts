import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadata extends ITokenMetadataBase {
  properties: {}
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  constructor(private readonly dataRepository: DataRepository) {}

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data)) {
      return null
    }
    data = this.dataRepository.getTokens().find(item => item.id === tokenId)
    if (isEmpty(data)) {
      return null
    }

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = null
      name = data.name
      description = data.description
      event = null
      special = false
      animated = false
      properties = data.properties
    })()
  }

  transformAttributes(properties) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mock(identifier: number, data: any): ITokenMetadata | null {
    throw new Error('unsupported')
  }
}
