const _controllers = []

const _metadataNormalizers = {}

const _dataRepositories = {}

const _tokenRepositories = {}

export function registerControllers(controllers) {
  controllers.forEach(controller => _controllers.push(controller))
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

export function getControllers() {
  return _controllers
}
