import { ITokenMetadata } from '@interfaces/token-metadata.interface'

export interface IMetadataEntity {
  hash: string
  value: ITokenMetadata
}

export class MetadataEntity implements IMetadataEntity {
  hash: string
  value: ITokenMetadata

  constructor(hash: string, value: ITokenMetadata) {
    this.hash = hash
    this.value = value
  }
}
