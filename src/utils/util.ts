import { cleanEnv, port, str } from 'envalid'

export function isEmpty(value: string | number | object): boolean {
  if (value === null) {
    return true
  } else if (typeof value !== 'number' && value === '') {
    return true
  } else if (typeof value === 'undefined' || value === undefined) {
    return true
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true
  } else {
    return false
  }
}

export function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    IMAGE_PORT: port(),
    METADATA_PORT: port(),
  })
}

export function getObjectValue(object: object, path: string) {
  return path.split('.').reduce((o, i) => o[i], object)
}
