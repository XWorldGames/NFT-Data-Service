export interface IImageEntity {
  mimetype: string
  buffer: Buffer
}

export class ImageEntity implements IImageEntity {
  readonly mimetype: string
  readonly buffer: Buffer

  constructor(mimetype: string, buffer: Buffer) {
    this.mimetype = mimetype
    this.buffer = buffer
  }
}
