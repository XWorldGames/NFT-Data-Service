import { ITokenMetadata } from '@interfaces/token-metadata.interface'

export interface ITokenMetadataNormalizer {
  normalize(tokenId: number, metadata: any): ITokenMetadata | null
  mock(identifier: number, data: any): ITokenMetadata | null
  transformAttributes(properties: any): any
}
