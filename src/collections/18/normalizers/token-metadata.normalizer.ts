import { Grade } from '@/enums'
import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  tp: number
  identifier: string
  character: number
  grade: number
  id: number
}

export interface ITokenMetadata extends ITokenMetadataBase {
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: string, data: any): ITokenMetadata | null {
    if (isEmpty(data)) {
      return null
    }

    const result = this.dataRepository.findById(tokenId)
    if (!result) {
      return null
    }

    return new (class implements ITokenMetadata {
      id = tokenId
      identifier = result.id
      collection_id = id
      name = `${result.name}`
      description = result.description
      event = null
      special = false
      animated = false
      properties = {
        identifier: result.id,
        tp: result.properties.tp,
        character: result.properties.character,
        grade: result.properties.grade,
        id: result.properties.id,
      }
    })()
  }

  transformAttributes(properties: ITokenMetadataProperties) {
    return [
      {
        display_type: 'string',
        trait_type: 'ID',
        value: properties.identifier,
      },
      {
        display_type: 'number',
        trait_type: 'Character',
        value: properties.character,
      },
      {
        display_type: 'number',
        trait_type: 'tp',
        value: properties.tp,
      },
      {
        display_type: 'number',
        trait_type: 'grade',
        value: properties.grade,
      },
      {
        display_type: 'number',
        trait_type: 'id',
        value: properties.id,
      },
    ]
  }

  mock(identifier: string, data: any): ITokenMetadata {
    return null
  }
}
