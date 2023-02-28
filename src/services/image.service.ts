import { HashedImageEntity, IHashedImageEntity } from '@/entities/hashed-image.entity'
import { ImageEntity } from '@/entities/image.entity'
import { IMetadataEntity } from '@/entities/metadata.entity'
import { IImageResizingOptions, ImageResizingProcessor } from '@/image-processors/image-resizing-processor'
import { TokenImageGenerationProcessor } from '@/image-processors/token-image-generation-processor'
import { ThumbnailRepository } from '@repositories/thumbnail.repository'
import { TokenImageRepository } from '@repositories/token-image.repository'
import { MetadataService } from '@services/metadata.service'
import { pathExists, readFile, resolvePath } from '@utils/filesystem'
import config from 'config'
import fileType from 'file-type'
import objectHash from 'object-hash'
import { Inject, Service } from 'typedi'

type OriginalImageResolver = () => PromiseLike<IHashedImageEntity>

@Service()
export class ImageService {
  constructor(
    @Inject()
    private readonly metadataService: MetadataService,

    @Inject()
    private readonly tokenImageRepository: TokenImageRepository,

    @Inject()
    private readonly thumbnailRepository: ThumbnailRepository,

    @Inject()
    private readonly tokenImageGenerationProcessor: TokenImageGenerationProcessor,

    @Inject()
    private readonly imageResizingProcessor: ImageResizingProcessor,

    private readonly resourceDir: string = resolvePath(config.get('resource.dir')),
  ) {}

  public async findTokenImage(
    collectionId: number,
    tokenId: string,
    resizeOptions?: IImageResizingOptions,
    knownHash?: string,
  ): Promise<IHashedImageEntity | true | null> {
    const metadata = await this.metadataService.findByTokenId(collectionId, tokenId)
    if (!metadata) {
      return null
    }
    if (knownHash === metadata.hash) {
      return true
    }
    let image
    if (resizeOptions) {
      image = await this.getThumbnail(`T:${collectionId}:${tokenId}`, metadata.hash, resizeOptions, async () =>
        this.getTokenImageByMetadata(metadata),
      )
    } else {
      image = await this.getTokenImageByMetadata(metadata)
    }
    console.log("-------------------------------------------image = "+image)
    return image
  }

  public resolveAssetImagePath(collectionId: number, path: string) {
    return resolvePath(this.resourceDir, String(collectionId), 'images', path)
  }

  public async findAssetImage(
    collectionId: number,
    path: string,
    resizeOptions?: IImageResizingOptions,
    knownHash?: string,
  ): Promise<IHashedImageEntity | true | null> {
    path = this.resolveAssetImagePath(collectionId, path)
    if (!(await pathExists(path))) {
      return null
    }
    const hash = objectHash(path)
    if (knownHash === hash) {
      return true
    }
    let image
    if (resizeOptions) {
      image = await this.getThumbnail(`A:${hash}`, hash, resizeOptions, async () => this.getAssetImage(path, hash))
    } else {
      image = await this.getAssetImage(path, hash)
    }
    return image
  }

  public async findMockTokenImage(
    collectionId: number,
    identifier: number,
    mockData: any,
    resizeOptions?: IImageResizingOptions,
    knownHash?: string,
  ): Promise<IHashedImageEntity | true | null> {
    const metadata = await this.metadataService.getMockTokenByIdentifierWithGivenData(collectionId, identifier, mockData)
    if (!metadata) {
      return null
    }
    if (knownHash === metadata.hash) {
      return true
    }
    let image
    if (resizeOptions) {
      image = await this.getThumbnail(`MTT:${metadata.hash}`, metadata.hash, resizeOptions, async () => this.getMockTokenImageByMetadata(metadata))
    } else {
      image = await this.getMockTokenImageByMetadata(metadata)
    }
    return image
  }

  private async getMockTokenImageByMetadata({ hash, value }: IMetadataEntity): Promise<IHashedImageEntity | null> {
    const key = this.thumbnailRepository.resolveKey(`MT:${hash}`, { params: {} })
    let hashedImage = await this.thumbnailRepository.get(key)
    if (!hashedImage || hash !== hashedImage.hash) {
      const image = await this.tokenImageGenerationProcessor.generate(value.collection_id, value)
      hashedImage = new HashedImageEntity(hash, image)
      await this.thumbnailRepository.put(key, hashedImage)
    }
    return hashedImage
  }

  private async getAssetImage(path: string, hash: string): Promise<IHashedImageEntity> {
    const buffer = await readFile(path)
    return new HashedImageEntity(hash, new ImageEntity((await fileType.fromBuffer(buffer)).mime, buffer))
  }

  private async getTokenImageByMetadata({ hash, value }: IMetadataEntity): Promise<IHashedImageEntity | null> {
    const key = this.tokenImageRepository.resolveKey(value.collection_id, value.id)
    let hashedImage = await this.tokenImageRepository.get(key)
    if (!hashedImage || hash !== hashedImage.hash) {
      const image = await this.tokenImageGenerationProcessor.generate(value.collection_id, value)
      hashedImage = new HashedImageEntity(hash, image)
      await this.tokenImageRepository.put(key, hashedImage)
    }
    return hashedImage
  }

  private async getThumbnail(
    id: string,
    hash: string,
    resizeOptions: IImageResizingOptions,
    resolveOriginal: OriginalImageResolver,
  ): Promise<IHashedImageEntity | null> {
    const key = this.thumbnailRepository.resolveKey(id, resizeOptions)
    let hashedImage = await this.thumbnailRepository.get(key)
    if (!hashedImage || hash !== hashedImage.hash) {
      const original = await resolveOriginal()
      if (!resizeOptions.format) {
        resizeOptions.format = original.image.mimetype
      }
      const buffer = await this.imageResizingProcessor.resize(original.image.buffer, resizeOptions)
      hashedImage = new HashedImageEntity(hash, new ImageEntity((await fileType.fromBuffer(buffer)).mime, buffer))
      await this.thumbnailRepository.put(key, hashedImage)
    }
    return hashedImage
  }
}
