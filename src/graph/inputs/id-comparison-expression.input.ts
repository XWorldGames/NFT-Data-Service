import { Field, ID, InputType } from 'type-graphql'

@InputType()
export class IDComparisonExpression {
  @Field(() => ID, { nullable: true })
  _eq?: number

  @Field(() => ID, { nullable: true })
  _gt?: number

  @Field(() => ID, { nullable: true })
  _gte?: number

  @Field(() => [ID], { nullable: true })
  _in?: number[]

  @Field(() => ID, { nullable: true })
  _lt?: number

  @Field(() => ID, { nullable: true })
  _lte?: number

  @Field(() => ID, { nullable: true })
  _ne?: number

  @Field(() => [ID], { nullable: true })
  _nin?: number[]
}
