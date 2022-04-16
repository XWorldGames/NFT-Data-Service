import { SkillType } from '@/enums'
import { Field, Int, ObjectType } from 'type-graphql'
import { SkillEffect } from './skill-effect.type'

@ObjectType({ description: 'The skill details of the character.' })
export class Skill {
  @Field(() => Int, { description: 'The ID of the skill.' })
  id: number

  @Field({ description: 'The version of the DreamCard.' })
  version: string

  @Field({ description: 'The name of the skill.' })
  name: string

  @Field(() => SkillType, { description: 'The type of the skill.' })
  type: SkillType

  @Field(() => [SkillEffect], { description: 'The effects of the skill.' })
  effects: SkillEffect[]
}
