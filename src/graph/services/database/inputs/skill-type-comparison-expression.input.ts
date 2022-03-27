import { Field, InputType } from 'type-graphql'
import { SkillType } from '../enums'

@InputType()
export class SkillTypeComparisonExpression {
  @Field(() => SkillType, { nullable: true })
  _eq?: SkillType

  @Field(() => [SkillType], { nullable: true })
  _in?: SkillType[]

  @Field(() => SkillType, { nullable: true })
  _ne?: SkillType

  @Field(() => [SkillType], { nullable: true })
  _nin?: SkillType[]
}
