import { compileFilterQuery } from '@ericyzhu/mql-match'
import { IImageCompositionConfiguration } from '@interfaces/image-composition-configuration.interface'
import { ContractInterface } from '@services/blockchain.service'
import { readJsonFileSync, resolvePath } from '@utils/filesystem'
import chokidar from 'chokidar'
import config from 'config'

export abstract class AbstractDataRepository {
  protected readonly collectionId: number
  protected readonly resourceDataDir: string
  private readonly resourceImageDir: string
  private readonly watcher: chokidar.FSWatcher
  private abi: ContractInterface
  private imageCompositionConfiguration: IImageCompositionConfiguration

  protected constructor(collectionId: number) {
    this.collectionId = collectionId
    this.resourceDataDir = resolvePath(config.get('resource.dir'), String(collectionId), 'data')
    this.resourceImageDir = resolvePath(config.get('resource.dir'), String(collectionId), 'images')
    this.watcher = chokidar.watch(this.resourceDataDir, { ignored: /^\./, persistent: true })
    this.watcher.on('change', (filepath: string) => {
      this.loadAbi()
      this.loadImageCompositionConfiguration()
      this.onDataFileChange(filepath)
    })
    this.loadAbi()
    this.loadImageCompositionConfiguration()
  }

  public getAbi(): ContractInterface {
    return this.abi
  }

  public getImageCompositionConfiguration(): IImageCompositionConfiguration {
    return this.imageCompositionConfiguration
  }

  protected abstract onDataFileChange(filepath: string): void

  private loadAbi(): void {
    this.abi = readJsonFileSync(resolvePath(this.resourceDataDir, 'abi.json'))
  }

  private loadImageCompositionConfiguration(): void {
    this.imageCompositionConfiguration = readJsonFileSync(resolvePath(this.resourceDataDir, 'image-composition.json'))
    for (const k in this.imageCompositionConfiguration.elements) {
      const resource = this.imageCompositionConfiguration.elements[k].resource
      resource.path = this.resolveResourcePath(resource.path)
      if (resource.framesPath) {
        resource.framesPath = this.resolveResourcePath(resource.framesPath)
      }
      if (this.imageCompositionConfiguration.elements[k].when) {
        this.imageCompositionConfiguration.elements[k].when = compileFilterQuery(this.imageCompositionConfiguration.elements[k].when)
      }
    }
  }

  private resolveResourcePath(path: string) {
    if (path.startsWith('/')) {
      const [, collectionId, resourcePath] = path.match(/^\/(\d+)\/(.+)/i)
      return resolvePath(resolvePath(config.get('resource.dir'), String(collectionId), 'images'), resourcePath)
    }
    return resolvePath(this.resourceImageDir, path)
  }
}
