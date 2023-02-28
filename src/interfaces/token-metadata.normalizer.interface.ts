import { ITokenMetadata } from '@interfaces/token-metadata.interface'

export interface ITokenMetadataNormalizer {
  normalize(tokenId: any, metadata: any): ITokenMetadata | null
  mock(identifier: any, data: any): ITokenMetadata | null
  transformAttributes(properties: any): any
}
