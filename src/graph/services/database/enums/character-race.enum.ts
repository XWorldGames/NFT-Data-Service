import { CharacterRace } from '@/enums'
import { registerEnumType } from 'type-graphql'

registerEnumType(CharacterRace, {
  name: 'CharacterRace',
  description: 'The character races',
})
