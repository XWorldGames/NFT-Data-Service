import { Grade, TalentKind } from '@/enums'
import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  identifier: number
  grade: number
  kind: number
  level: number
  star: number
  generation: number
  experience: number
}

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  name: string
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data) || Number(data.tp) === 0) {
      return null
    }

    const talent = this.dataRepository.findTalentByCode(String(data.tp))
    if (!talent) {
      return null
    }

    const grade = Number(data.grade)
    const level = Number(data.level)
    const experience = Number(data.exp)
    const star = level % 5 || 5
    const generation = Math.ceil(level / 5)
    const kind = talent.properties.kind

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = talent.id
      code = talent.code
      name = `${talent.name}`
      description = talent.description
      event = talent.event
      special = talent.special
      animated = talent.animated
      properties = {
        identifier: talent.id,
        kind,
        grade,
        level,
        star,
        generation,
        experience,
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
        trait_type: 'Grade',
        value: Grade[properties.grade],
      },
      {
        display_type: 'number',
        trait_type: 'Generation',
        value: properties.generation,
      },
      {
        display_type: 'number',
        trait_type: 'Star',
        value: properties.star,
      },
      {
        trait_type: 'Kind',
        value: TalentKind[properties.kind],
      },
      {
        display_type: 'number',
        trait_type: 'Level',
        value: properties.level,
      },
      {
        display_type: 'number',
        trait_type: 'Experience',
        value: properties.experience,
      },
    ]
  }

  mock(identifier: number, data: any): ITokenMetadata | null {
    const talent = this.dataRepository.findTalentById(identifier)
    if (!talent) {
      return null
    }

    const grade = data.grade || 1
    const level = data.level || 1
    const experience = 0
    const star = level % 5
    const generation = Math.ceil(level / 5)
    const kind = talent.properties.kind

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = talent.id
      code = talent.code
      name = talent.name
      description = talent.description
      event = talent.event
      special = talent.special
      animated = talent.animated
      properties = {
        identifier: talent.id,
        kind,
        grade,
        level,
        star,
        generation,
        experience,
      }
    })()
  }
}
