import { IMetadataEntity } from '@/entities/metadata.entity'
import { ensurePath } from '@utils/filesystem'
import config from 'config'
import level, { LevelDB } from 'level'
import { Service } from 'typedi'

@Service()
export class MetadataRepository {
  private readonly db: LevelDB

  constructor() {
    this.db = level(ensurePath(config.get('db.dir'), 'metadata'), { valueEncoding: 'json' })
  }

  resolveKey(tokenCollectionId: number, tokenId: number) {
    return `${tokenCollectionId}:${tokenId}`
  }

  async get(key: string): Promise<IMetadataEntity | null> {
    try {
      return await this.db.get(key)
    } catch (error) {
      if (error.notFound) {
        return null
      }
      throw error
    }
  }

  async put(key: string, data: IMetadataEntity): Promise<void> {
    await this.db.put(key, data)
  }
}
