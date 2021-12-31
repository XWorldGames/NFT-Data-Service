import { IImageEntity } from '@/entities/image.entity'

export interface IHashedImageEntity {
  hash: string
  image: IImageEntity
}

export class HashedImageEntity implements IHashedImageEntity {
  readonly hash: string
  readonly image: IImageEntity

  constructor(hash: string, image: IImageEntity) {
    this.hash = hash
    this.image = image
  }
}
