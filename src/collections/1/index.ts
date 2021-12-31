import { registerControllers, registerDataRepository, registerMetadataNormalizer, registerTokenRepository } from '@/collection'
import { AssetController } from './controllers/asset.controller'
import id from './id'
import { TokenMetadataNormalizer } from './normalizers/token-metadata.normalizer'
import { DataRepository } from './repositories/data.repository'
import { TokenRepository } from './repositories/token.repository'

registerMetadataNormalizer(id, TokenMetadataNormalizer)
registerDataRepository(id, DataRepository)
registerTokenRepository(id, TokenRepository)
registerControllers([AssetController])
