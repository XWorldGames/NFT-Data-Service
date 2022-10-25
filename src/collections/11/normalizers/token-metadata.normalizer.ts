import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  identifier: number
  element: number
}

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  properties: ITokenMetadataProperties
}

enum Element {
  None,
  Wind,
  Water,
  Fire,
  Earth,
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data) || isEmpty(data.role)) {
      return null
    }

    const character = this.dataRepository.findCharacterByTokenRepositoryId(Number(data.role))
    if (!character) {
      return null
    }

    const element = Number(data.element)

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = character.id
      code = character.code
      name = `${character.name}`
      description = character.description
      event = character.event
      special = character.special
      animated = character.animated
      properties = {
        identifier: character.id,
        element,
      }
    })()
  }

  transformAttributes(properties: ITokenMetadataProperties) {
    return [
      {
        display_type: 'number',
        trait_type: 'Identifier',
        value: properties.identifier,
      },
      {
        trait_type: 'Element',
        value: Element[properties.element],
      },
    ]
  }

  mock(identifier: number, data: any): ITokenMetadata {
    const character = this.dataRepository.findCharacterById(identifier)
    if (!character) {
      return null
    }

    const element = data.element || 0

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = character.id
      code = character.code
      name = character.name
      description = character.description
      event = character.event
      special = character.special
      animated = character.animated
      properties = {
        identifier: character.id,
        element,
      }
    })()
  }
}
