import { Grade } from '@/enums'
import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { BN } from 'bn.js'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  identifier: number
  type: number
  character: number
  grade: number
}

export interface ICharacterTokenMetadataProperties extends ITokenMetadataProperties {
  level: number
  experience: number
  combat_power: number
  avatar: number
  skill: number
}

export interface IMediaTokenMetadataProperties extends ITokenMetadataProperties {
  media_type: number
  media_id: number
  media_url: string
}

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data) || isEmpty(data.role)) {
      return null
    }

    const type = Number(data.tp)
    const character = Number(data.role)
    const grade = Number(data.grade)

    const reserveData = new BN(data.reserve1.toString())

    if (type === 1) {
      const result = this.dataRepository.findCharacterByCode(new BN(character).shln(24).toString(10))
      if (!result) {
        return null
      }

      const level = reserveData.and(new BN(0xff)).toNumber()
      const experience = reserveData.shrn(8).and(new BN('ffffffffffffffff', 16)).toNumber()
      const combatPower = reserveData
        .shrn(8 + 64)
        .and(new BN('ffffffffffffffff', 16))
        .toNumber()
      const avatar = reserveData
        .shrn(8 + 64 + 64)
        .and(new BN(0xffffffff))
        .toNumber()
      const skill = reserveData
        .shrn(8 + 64 + 64 + 32)
        .and(new BN(0xffffffff))
        .toNumber()

      return new (class implements ITokenMetadata {
        id = Number(tokenId)
        collection_id = id
        identifier = result.id
        code = result.code
        name = `${result.name} ${Grade[grade]}`
        description = result.description
        event = result.event
        special = result.special
        animated = result.animated
        properties = {
          identifier: result.id,
          type,
          character,
          grade,
          level,
          experience,
          combat_power: combatPower,
          avatar,
          skill,
        }
      })()
    } else if (type === 2) {
      const mediaType = reserveData.and(new BN(0xffff)).toNumber()
      const mediaId = reserveData.shrn(16).and(new BN(0xffff)).toNumber()

      const result = this.dataRepository.findMediaByCode(new BN(mediaType).shln(24).or(new BN(mediaId)).toString(10))
      if (!result) {
        return null
      }

      return new (class implements ITokenMetadata {
        id = Number(tokenId)
        collection_id = id
        identifier = result.id
        code = result.code
        name = `${result.name} ${Grade[grade]}`
        description = result.description
        event = result.event
        special = result.special
        animated = result.animated
        properties = {
          identifier: result.id,
          type,
          character,
          grade,
          media_type: mediaType,
          media_id: mediaId,
          media_url: result.properties.url,
        }
      })()
    }

    return null
  }

  transformAttributes(properties: ICharacterTokenMetadataProperties & IMediaTokenMetadataProperties) {
    const data = [
      {
        display_type: 'number',
        trait_type: 'Identifier',
        value: properties.identifier,
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
      {
        display_type: 'number',
        trait_type: 'Character',
        value: properties.character,
      },
    ]

    if (properties.type === 1) {
      data.concat([
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
        {
          display_type: 'number',
          trait_type: 'Combat Power',
          value: properties.combat_power,
        },
        {
          display_type: 'number',
          trait_type: 'Avatar',
          value: properties.avatar,
        },
        {
          display_type: 'number',
          trait_type: 'Skill',
          value: properties.skill,
        },
      ])
    } else {
      data.concat([
        {
          display_type: 'number',
          trait_type: 'Media Type',
          value: properties.media_type,
        },
        {
          display_type: 'number',
          trait_type: 'Media ID',
          value: properties.media_id,
        },
        {
          trait_type: 'Media URL',
          value: properties.media_url,
        },
      ])
    }

    return data
  }

  mock(identifier: number, data: any): ITokenMetadata {
    return null
  }
}
