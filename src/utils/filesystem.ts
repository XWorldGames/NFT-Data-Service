import { BASE_PATH } from '@/consts'
import fs from 'fs'
import Glob from 'glob'
import nodePath from 'path'
import naturalCompare from 'string-natural-compare'

export async function glob(pattern): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Glob(pattern, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(files.sort(naturalCompare))
      }
    })
  })
}

export function ensureDir(path: string) {
  fs.mkdirSync(nodePath.dirname(path), { recursive: true })
}

export function resolvePath(...pathSegments) {
  if (pathSegments[0] && pathSegments[0].indexOf('.') === 0) {
    pathSegments.unshift(BASE_PATH)
  }
  return nodePath.resolve(...pathSegments)
}

export function ensurePath(...pathSegments) {
  const path = resolvePath(...pathSegments)
  ensureDir(path)
  return path
}

export const pathExists = async (path: string) => {
  try {
    await fs.promises.access(path, fs.constants.R_OK)
  } catch (_) {
    return false
  }
  return true
}

export async function readFile(filepath): Promise<Buffer> {
  return fs.promises.readFile(resolvePath(filepath))
}

export function readFileSync(...pathSegments): Buffer {
  return fs.readFileSync(resolvePath(...pathSegments))
}

export function readJsonFileSync(...pathSegments) {
  return JSON.parse(fs.readFileSync(resolvePath(...pathSegments), { encoding: 'utf8' }))
}
