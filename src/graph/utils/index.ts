import { compileFilterQuery } from '@ericyzhu/mql-match'

function resolveRegexFilter(value: string): RegExp | string {
  const matches = value.match(/^\/(.+)\/([a-z]*)$/)
  return matches ? new RegExp(matches[1], matches[2]) : value
}

export function normalizeFilterQuery(input, path?: string) {
  let output = {}
  for (const key in input) {
    if (key.startsWith('_')) {
      if (['_and', '_or', '_not'].indexOf(key) !== -1) {
        output[key.replace(/^_/, '$')] = input[key].map(item => normalizeFilterQuery(item))
      } else {
        output[path] = Object.assign(output[path] ?? {}, {
          [key.replace(/^_/, '$')]: key === '_regex' ? resolveRegexFilter(input[key]) : input[key],
        })
      }
    } else {
      output = Object.assign(output, normalizeFilterQuery(input[key], `${path ? `${path}.` : ''}${key}`))
    }
  }
  return output
}

export function compileFilterInput(input) {
  return compileFilterQuery(normalizeFilterQuery(input))
}
