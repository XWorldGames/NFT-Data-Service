import { registerEnumType } from 'type-graphql'

export enum Grade {
  Common = 1,
  Rare,
  Epic,
  Legendary,
  Mythic,
}

registerEnumType(Grade, {
  name: 'Grade',
  description: 'The grades',
})
