import { Field, Int, ObjectType } from 'type-graphql'
import { CharacterGradedProperties } from './character-graded-properties.type'

@ObjectType({ description: 'The graded data of the character.' })
export class CharacterGraded {
  @Field(() => Int, { description: "The level of the character's grade." })
  level: number

  @Field(() => CharacterGradedProperties, { description: "The properties of the character's graded data." })
  properties: CharacterGradedProperties
}
