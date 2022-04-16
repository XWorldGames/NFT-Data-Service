import { SkillType } from '@/enums'
import { registerEnumType } from 'type-graphql'

registerEnumType(SkillType, {
  name: 'SkillType',
  description: 'The skill types',
})
