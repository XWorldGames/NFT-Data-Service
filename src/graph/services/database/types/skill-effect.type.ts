import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType({ description: 'The effect of the skill.' })
export class SkillEffect {
  @Field(() => Int, { description: 'The level of the skill.' })
  level: number

  @Field({ description: 'The description of the skill.' })
  description: string
}
