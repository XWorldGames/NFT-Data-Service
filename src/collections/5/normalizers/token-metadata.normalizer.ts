import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Service } from 'typedi'
import id from '../id'

export interface ITokenMetadata extends ITokenMetadataBase {
  properties: {
    level_pool_id: number
    level_round: number
    winning_points: number
  }
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data)) {
      return null
    }

    const levelPoolId = Number(data.NFTType)
    const levelRound = Number(data.NFTFixedData)
    const winningPoints = Number(data.NFTTypeID)

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = null
      name = 'Level Prize'
      description = ''
      event = null
      special = false
      animated = false
      properties = {
        level_pool_id: levelPoolId,
        level_round: levelRound,
        winning_points: winningPoints,
      }
    })()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mock(identifier: number, data: any): ITokenMetadata | null {
    throw new Error('unsupported')
  }
}
