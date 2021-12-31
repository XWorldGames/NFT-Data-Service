import { Action, createParamDecorator } from 'routing-controllers'

export function KnownHashParam() {
  return createParamDecorator({
    required: false,
    value(action: Action): string | undefined {
      const value = action.request.headers['if-none-match']
      return typeof value === 'string' ? value.replace(/"/g, '').trim().toLowerCase() : undefined
    },
  })
}
