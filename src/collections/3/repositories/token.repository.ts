import { BlockchainService, Contract } from '@services/blockchain.service'
import config from 'config'
import { Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

@Service()
export class TokenRepository {
  private contract: Contract

  constructor(private readonly dataRepository: DataRepository, private readonly blockchainService: BlockchainService) {
    this.contract = this.blockchainService.contract(
      this.dataRepository.getAbi(),
      config.get(`contracts.${id}`),
      contract => (this.contract = contract),
    )
  }

  async get(tokenId: number) {
    return await this.contract.getMysteryBoxData(tokenId)
  }
}
