import { Field, InputType, Int } from 'type-graphql'

@InputType()
export class IntComparisonExpression {
  @Field(() => Int, { nullable: true })
  _eq?: number

  @Field(() => Int, { nullable: true })
  _gt?: number

  @Field(() => Int, { nullable: true })
  _gte?: number

  @Field(() => [Int], { nullable: true })
  _in?: number[]

  @Field(() => Int, { nullable: true })
  _lt?: number

  @Field(() => Int, { nullable: true })
  _lte?: number

  @Field(() => Int, { nullable: true })
  _ne?: number

  @Field(() => [Int], { nullable: true })
  _nin?: number[]
}
