import { IntComparisonExpression, StringComparisonExpression } from '@/graph/inputs'
import { Field, InputType } from 'type-graphql'
import { SkillTypeComparisonExpression } from '../inputs'
import { SkillEffectFilter } from './skill-effect.filter'

@InputType({ description: 'The filter of the skill.' })
export class SkillFilter {
  @Field(() => IntComparisonExpression, { nullable: true, description: 'The ID comparison expression of the skill.' })
  id?: IntComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: 'The version comparison expression of the skill.' })
  version?: StringComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: 'The name comparison expression of the skill.' })
  name?: StringComparisonExpression

  @Field(() => SkillTypeComparisonExpression, { nullable: true, description: 'The type comparison expression of the skill.' })
  type?: SkillTypeComparisonExpression

  @Field(() => SkillEffectFilter, { nullable: true, description: 'The effect filter of the skill.' })
  effects?: SkillEffectFilter
}
