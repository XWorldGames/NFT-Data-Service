import { HASH_SIZE } from '@/consts'
import { HashedImageEntity, IHashedImageEntity } from '@/entities/hashed-image.entity'
import { ImageEntity } from '@/entities/image.entity'
import { ensurePath } from '@utils/filesystem'
import config from 'config'
import fileType from 'file-type'
import level, { LevelDB } from 'level'
import { Service } from 'typedi'

@Service()
export class TokenImageRepository {
  private readonly db: LevelDB

  constructor() {
    this.db = level(ensurePath(config.get('db.dir'), 'token.image'), { valueEncoding: 'binary' })
  }

  resolveKey(collectionId: number, tokenId: string) {
    return `${collectionId}:${tokenId}`
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
    await this.db.put(key, Buffer.concat([image.buffer, Buffer.from(hash, 'hex')]))
  }
}
