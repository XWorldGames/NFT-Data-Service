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
  star_character: number
  fan_type: number
  grade: number
  max_sp: number
  sp: number
  invitor_nft_id: number
  producer_nft_id: number
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
    if (isEmpty(data) || isEmpty(data.starRole)) {
      return null
    }

    const maxSP = Number(data.maxSP)
    const sp = Number(data.sp)
    const invitorNftId = Number(data.invitorNftId)
    const producerNftId = Number(data.producerNftId)
    const starCharacter = Number(data.starRole)
    const fanType = Number(data.fanType)
    const grade = Number(data.grade)

    const result = this.dataRepository.findByCode(new BN(starCharacter).shln(24).or(new BN(fanType)).toString(10))
    if (!result) {
      return null
    }

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = result.id
      code = result.code
      name = `${result.name} ${Grade[grade]} #${tokenId}`
      description = result.description
      event = result.event
      special = result.special
      animated = result.animated
      properties = {
        identifier: result.id,
        star_character: starCharacter,
        fan_type: fanType,
        grade,
        max_sp: maxSP,
        sp,
        invitor_nft_id: invitorNftId,
        producer_nft_id: producerNftId,
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
        display_type: 'number',
        trait_type: 'Star Character',
        value: properties.star_character,
      },
      {
        display_type: 'number',
        trait_type: 'Fan Type',
        value: properties.fan_type,
      },
      {
        trait_type: 'Grade',
        value: Grade[properties.grade],
      },
      {
        display_type: 'number',
        trait_type: 'Max SP',
        value: properties.max_sp,
      },
      {
        display_type: 'number',
        trait_type: 'SP',
        value: properties.sp,
      },
      {
        display_type: 'number',
        trait_type: 'Invitor NFT ID',
        value: properties.invitor_nft_id,
      },
      {
        display_type: 'number',
        trait_type: 'Producer NFT ID',
        value: properties.producer_nft_id,
      },
    ]
  }

  mock(identifier: number, data: any): ITokenMetadata {
    return null
  }
}
