import { BlockchainService, Contract } from '@services/blockchain.service'
import { logger } from '@utils/logger'
import config from 'config'
import { Service } from 'typedi'
import abi from '../abi.json'
import id from '../id'

@Service()
export class TokenRepository {
  private contract: Contract

  constructor(private readonly blockchainService: BlockchainService) {
    this.contract = this.blockchainService.contract(abi, config.get(`contracts.${id}`), contract => (this.contract = contract))
  }

  async get(tokenId: number) {
    try {
      const data = await this.contract.getNftData(tokenId)
      return data && data.role > 0 ? data : null
    } catch (error) {
      logger.error(`[BLOCKCHAIN] TokenRepository.get() >> ${id}:${tokenId}, Message:: ${error.message}`)
      return null
    }
  }
}
