import { Field, InputType } from 'type-graphql'

@InputType()
export class StringComparisonExpression {
  @Field({ nullable: true })
  _eq?: string

  @Field({ nullable: true })
  _gt?: string

  @Field({ nullable: true })
  _gte?: string

  @Field(() => [String], { nullable: true })
  _in?: string[]

  @Field({ nullable: true })
  _lt?: string

  @Field({ nullable: true })
  _lte?: string

  @Field({ nullable: true })
  _ne?: string

  @Field(() => [String], { nullable: true })
  _nin?: string[]

  @Field({ nullable: true })
  _regex?: string
}
