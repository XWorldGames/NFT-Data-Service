import { Element } from '@/enums'
import { registerEnumType } from 'type-graphql'

registerEnumType(Element, {
  name: 'Element',
  description: 'The elements',
})
