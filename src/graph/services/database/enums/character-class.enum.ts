import { registerEnumType } from 'type-graphql'

export enum CharacterClass {
  Knight = 1,
  Assassin,
  Archer,
  Mage,
  Priest,
}

registerEnumType(CharacterClass, {
  name: 'CharacterClass',
  description: 'The character classes',
})
