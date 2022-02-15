import id from '@/collections/5/id'
import { BlockchainService, Contract } from '@services/blockchain.service'
import config from 'config'
import { Service } from 'typedi'
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
    return await this.contract.exists(tokenId)
  }
}
