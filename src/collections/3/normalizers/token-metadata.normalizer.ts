import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Service } from 'typedi'
import id from '../id'

export interface ITokenMetadataProperties {
  type: number
}

export interface ITokenMetadata extends ITokenMetadataBase {
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data) || (data.mbType === 0 && data.mbTypeId === 0)) {
      return null
    }

    const type = Number(data.mbType)

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = type
      name = `Mystery Box of Equipment`
      description = ''
      event = null
      special = false
      animated = false
      properties = {
        type,
      }
    })()
  }

  transformAttributes(properties: ITokenMetadataProperties) {
    return [
      {
        display_type: 'number',
        trait_type: 'Type',
        value: properties.type,
      },
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mock(identifier: number, data: any): ITokenMetadata | null {
    throw new Error('unsupported')
  }
}
