import { Field, InputType } from 'type-graphql'

@InputType()
export class BooleanComparisonExpression {
  @Field({ nullable: true })
  _eq?: boolean

  @Field(() => [Boolean], { nullable: true })
  _in?: boolean[]

  @Field({ nullable: true })
  _ne?: boolean

  @Field(() => [Boolean], { nullable: true })
  _nin?: boolean[]
}
