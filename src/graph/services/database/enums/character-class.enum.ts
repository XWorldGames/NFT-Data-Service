import { CharacterClass } from '@/enums'
import { registerEnumType } from 'type-graphql'

registerEnumType(CharacterClass, {
  name: 'CharacterClass',
  description: 'The character classes',
})
