import { Grade } from '@/enums'
import { registerEnumType } from 'type-graphql'

registerEnumType(Grade, {
  name: 'Grade',
  description: 'The grades',
})
