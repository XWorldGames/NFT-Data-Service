import { BlockchainService, Contract } from '@services/blockchain.service'
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
    return await this.contract.getNftData(tokenId)
  }
}
