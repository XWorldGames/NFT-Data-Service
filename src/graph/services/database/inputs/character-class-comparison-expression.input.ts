import { CharacterClass } from '@/enums'
import { Field, InputType } from 'type-graphql'

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
