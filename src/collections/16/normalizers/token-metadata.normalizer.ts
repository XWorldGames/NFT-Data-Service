import { Grade } from '@/enums'
import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  type: number
  id: number
  character: number
  grade: number
}

export interface ITokenMetadata extends ITokenMetadataBase {
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data)) {
      return null
    }

    const result = this.dataRepository.findById(tokenId)
    if (!result) {
      return null
    }

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      identifier = result.id
      collection_id = id
      name = `${result.name} ${Grade[result.properties.grade]}`
      description = result.description
      event = null
      special = false
      animated = false
      properties = {
        identifier: result.id,
        type: result.properties.type,
        id: result.properties.id,
        character: result.properties.character,
        grade: result.properties.grade,
      }
    })()
  }

  transformAttributes(properties: ITokenMetadataProperties) {
    return [
      {
        display_type: 'string',
        trait_type: 'ID',
        value: properties.id,
      },
      {
        display_type: 'number',
        trait_type: 'Character',
        value: properties.character,
      },
      {
        display_type: 'number',
        trait_type: 'Type',
        value: properties.type,
      },
      {
        trait_type: 'Grade',
        value: Grade[properties.grade],
      },
    ]
  }

  mock(identifier: number, data: any): ITokenMetadata {
    return null
  }
}
