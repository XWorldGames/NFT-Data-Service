import { HASH_SIZE } from '@/consts'
import { HashedImageEntity, IHashedImageEntity } from '@/entities/hashed-image.entity'
import { ImageEntity } from '@/entities/image.entity'
import { IImageResizingOptions } from '@/image-processors/image-resizing-processor'
import { ensurePath } from '@utils/filesystem'
import config from 'config'
import fileType from 'file-type'
import level from 'level'
import ttl, { LevelTTL } from 'level-ttl'
import objectHash from 'object-hash'
import { Service } from 'typedi'

@Service()
export class ThumbnailRepository {
  private readonly db: LevelTTL

  constructor() {
    this.db = ttl(level(ensurePath(config.get('db.dir'), 'thumbnail'), { valueEncoding: 'binary' }))
  }

  resolveKey(id: string, resizeOptions: IImageResizingOptions) {
    return `${id}:${objectHash(resizeOptions)}`
  }

  async get(key: string): Promise<IHashedImageEntity | null> {
    try {
      const buffer = await this.db.get(key)
      return new HashedImageEntity(
        buffer.slice(-HASH_SIZE).toString('hex'),
        new ImageEntity((await fileType.fromBuffer(buffer)).mime, buffer.slice(0, buffer.length - HASH_SIZE)),
      )
    } catch (error) {
      if (error.notFound) {
        return null
      }
      throw error
    }
  }

  async put(key: string, { hash, image }: IHashedImageEntity): Promise<void> {
    await this.db.put(key, Buffer.concat([image.buffer, Buffer.from(hash, 'hex')]), { ttl: 86400 * 30 })
  }
}
