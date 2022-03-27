import { Field, InputType } from 'type-graphql'
import { Grade } from '../enums'

@InputType()
export class GradeComparisonExpression {
  @Field(() => Grade, { nullable: true })
  _eq?: Grade

  @Field(() => [Grade], { nullable: true })
  _in?: Grade[]

  @Field(() => Grade, { nullable: true })
  _ne?: Grade

  @Field(() => [Grade], { nullable: true })
  _nin?: Grade[]
}
