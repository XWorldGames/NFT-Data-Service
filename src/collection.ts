const _imageControllers = []

const _metadataControllers = []

const _databaseGraphQLResolvers = []

const _metadataNormalizers = {}

const _dataRepositories = {}

const _tokenRepositories = {}

export function registerImageControllers(controllers) {
  controllers.forEach(controller => _imageControllers.push(controller))
}

export function registerMetadataControllers(controllers) {
  controllers.forEach(controller => _metadataControllers.push(controller))
}

export function registerDatabaseGraphQLResolvers(resolvers) {
  resolvers.forEach(resolver => _databaseGraphQLResolvers.push(resolver))
}

export function registerMetadataNormalizer(id, normalizer) {
  _metadataNormalizers[id] = normalizer
}

export function registerDataRepository(id, repository) {
  _dataRepositories[id] = repository
}

export function registerTokenRepository(id, repository) {
  _tokenRepositories[id] = repository
}

export function getMetadataNormalizers() {
  return _metadataNormalizers
}

export function getDataRepositories() {
  return _dataRepositories
}

export function getTokenRepositories() {
  return _tokenRepositories
}

export function getImageControllers() {
  return _imageControllers
}

export function getMetadataControllers() {
  return _metadataControllers
}

export function getDatabaseGraphQLResolvers() {
  return _databaseGraphQLResolvers
}
