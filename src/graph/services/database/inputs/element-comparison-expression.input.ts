import { Element } from '@/enums'
import { Field, InputType } from 'type-graphql'

@InputType()
export class ElementComparisonExpression {
  @Field(() => Element, { nullable: true })
  _eq?: Element

  @Field(() => [Element], { nullable: true })
  _in?: Element[]

  @Field(() => Element, { nullable: true })
  _ne?: Element

  @Field(() => [Element], { nullable: true })
  _nin?: Element[]
}
