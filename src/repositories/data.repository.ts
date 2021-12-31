import { getDataRepositories } from '@/collection'
import { IImageCompositionConfiguration } from '@interfaces/image-composition-configuration.interface'
import { Container, Service } from 'typedi'

@Service()
export class DataRepository {
  private readonly providers

  constructor() {
    const providers = {}
    Object.entries(getDataRepositories()).forEach(([collectionId, repository]) => (providers[collectionId] = Container.get(repository)))
    this.providers = providers
  }

  getProvider(collectionId: number) {
    return this.providers[collectionId]
  }

  getImageCompositionConfiguration(collectionId: number): IImageCompositionConfiguration {
    return this.getProvider(collectionId).getImageCompositionConfiguration()
  }
}
