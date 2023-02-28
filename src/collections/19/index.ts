import { registerDataRepository, registerMetadataNormalizer, registerTokenRepository } from '@/collection'
import id from './id'
import { TokenMetadataNormalizer } from './normalizers/token-metadata.normalizer'
import { DataRepository } from './repositories/data.repository'
import { TokenRepository } from './repositories/token.repository'

export const ID = id

registerMetadataNormalizer(id, TokenMetadataNormalizer)
registerDataRepository(id, DataRepository)
registerTokenRepository(id, TokenRepository)
