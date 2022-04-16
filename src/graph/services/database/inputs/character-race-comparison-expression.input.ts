import { CharacterRace } from '@/enums'
import { Field, InputType } from 'type-graphql'

@InputType()
export class CharacterRaceComparisonExpression {
  @Field(() => CharacterRace, { nullable: true })
  _eq?: CharacterRace

  @Field(() => [CharacterRace], { nullable: true })
  _in?: CharacterRace[]

  @Field(() => CharacterRace, { nullable: true })
  _ne?: CharacterRace

  @Field(() => [CharacterRace], { nullable: true })
  _nin?: CharacterRace[]
}
