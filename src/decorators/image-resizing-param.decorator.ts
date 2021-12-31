import { Format, IImageResizingOptions, IImageResizingParams, Param } from '@/image-processors/image-resizing-processor'
import { HttpNotFoundException } from '@exceptions/http-not-found.exception'
import { Action, createParamDecorator } from 'routing-controllers'

function validateParamValue(name: string, value: number): boolean {
  switch (name) {
    case Param.Width:
    case Param.Height:
      return value >= 1 && value <= 4096
    case Param.Mode:
      return [0, 1, 2].includes(value)
    case Param.Limit:
    case Param.Progressive:
      return [0, 1].includes(value)
    case Param.Proportional:
      return value >= 1 && value <= 1000
    case Param.Quality:
      return value >= 1 && value <= 100
  }
  return false
}

function parseParam(param: string) {
  const matches = param.match(/^(\d+)([a-z]+)$/)
  if (!matches || matches[0] === undefined || matches[1] === undefined) {
    return false
  }
  const name = matches[0]
  const value = parseInt(matches[1])
  if (!validateParamValue(name, value)) {
    return false
  }
  return { name, value }
}

function parse(options: string): IImageResizingOptions | false {
  const matches = options.match(/^(@(\d+[a-z]+)(_\d+[a-z]+)*)?(\.[\da-z]+)?$/i)
  if (!matches || !matches[0]) {
    return false
  }
  let match = matches[0]

  let format = null
  if (match.indexOf('.') !== -1) {
    const parts = match.split('.')
    if (Format[parts[1].toUpperCase()]) {
      format = parts[1]
      match = parts[0]
    } else {
      return false
    }
  }

  const params = {} as IImageResizingParams
  match
    .replace('@', '')
    .split('_')
    .map(item => {
      const param = parseParam(item)
      if (param) {
        params[param.name] = param.value
      } else {
        return false
      }
    })

  return { format, params }
}

export function ImageResizingParam(name?: string) {
  return createParamDecorator({
    required: false,
    value(action: Action): IImageResizingOptions | undefined {
      const value = action.request.params[name]
      let filter
      if (value) {
        filter = parse(value)
        if (!filter) {
          throw new HttpNotFoundException()
        }
      }
      return filter
    },
  })
}
