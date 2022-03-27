import { registerEnumType } from 'type-graphql'

export enum CharacterRace {
  Human,
  WingedElf,
  Orcs,
  Marai,
  Nightshade,
  Trench,
}

registerEnumType(CharacterRace, {
  name: 'CharacterRace',
  description: 'The character races',
})
