import { ImageService } from '@services/image.service'
import { Container } from 'typedi'

export abstract class AbstractImageController {
  protected readonly imageService: ImageService

  constructor() {
    this.imageService = Container.get(ImageService)
  }
}
