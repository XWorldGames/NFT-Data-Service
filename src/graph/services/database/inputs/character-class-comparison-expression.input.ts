import { Field, InputType } from 'type-graphql'
import { CharacterClass } from '../enums'

@InputType()
export class CharacterClassComparisonExpression {
  @Field(() => CharacterClass, { nullable: true })
  _eq?: CharacterClass

  @Field(() => [CharacterClass], { nullable: true })
  _in?: CharacterClass[]

  @Field(() => CharacterClass, { nullable: true })
  _ne?: CharacterClass

  @Field(() => [CharacterClass], { nullable: true })
  _nin?: CharacterClass[]
}
