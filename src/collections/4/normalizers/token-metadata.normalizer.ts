import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'
import { Grade } from "@/enums";

export interface ITokenMetadataProperties {
  identifier: number
  grade: number
  dividend: number
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
    if (isEmpty(data)) {
      return null
    }

    const asset = this.dataRepository.findById(tokenId)
    if (!asset) {
      return null
    }

    const grade = Number(asset.properties.grade)
    const dividend = Number(asset.properties.dividend)

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = asset.id
      code = asset.code
      name = `${asset.name} #${tokenId}`
      description = asset.description
      event = asset.event
      special = asset.special
      animated = asset.animated
      properties = {
        identifier: asset.id,
        grade,
        dividend,
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
        trait_type: 'Dividend',
        value: properties.dividend,
      },
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mock(identifier: number, data: any): ITokenMetadata | null {
    const asset = this.dataRepository.findById(identifier)
    if (!asset) {
      return null
    }

    const grade = Number(asset.properties.grade)
    const dividend = Number(asset.properties.dividend)

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = asset.id
      code = asset.code
      name = asset.name
      description = asset.description
      event = asset.event
      special = asset.special
      animated = asset.animated
      properties = {
        identifier: asset.id,
        grade,
        dividend,
      }
    })()
  }
}
