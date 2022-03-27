import { IntComparisonExpression, StringComparisonExpression } from '@/graph/inputs'
import { Field, InputType } from 'type-graphql'

@InputType({ description: "The filter of the skill's effect." })
export class SkillEffectFilter {
  @Field(() => IntComparisonExpression, { nullable: true, description: "The level comparison expression of the skill's effect filter." })
  level?: IntComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: "The description comparison expression of the skill's effect filter." })
  description?: StringComparisonExpression
}
