import { registerEnumType } from 'type-graphql'

export enum Element {
  None,
  Metal,
  Wood,
  Water,
  Fire,
  Earth,
}

registerEnumType(Element, {
  name: 'Element',
  description: 'The elements',
})
