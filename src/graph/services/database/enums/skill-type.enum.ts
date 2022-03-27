import { registerEnumType } from 'type-graphql'

export enum SkillType {
  Active = 1,
  Passive = 2,
}

registerEnumType(SkillType, {
  name: 'SkillType',
  description: 'The skill types',
})
