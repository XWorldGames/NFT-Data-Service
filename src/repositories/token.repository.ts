import { getTokenRepositories } from '@/collection'
import { Container, Service } from 'typedi'

@Service()
export class TokenRepository {
  private readonly providers: { [k: string]: any }

  constructor() {
    const providers = {}
    Object.entries(getTokenRepositories()).forEach(([collectionId, repository]) => (providers[collectionId] = Container.get(repository)))
    this.providers = providers
  }

  getProvider(collectionId: number) {
    return this.providers[collectionId]
  }

  async get(collectionId: number, tokenId: number) {
    return this.providers[collectionId].get(tokenId)
  }
}
