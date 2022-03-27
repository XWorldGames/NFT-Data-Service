import { Field, Int, ObjectType } from 'type-graphql'
import { CharacterGraded } from './character-graded.type'
import { CharacterProperties } from './character-properties.type'

@ObjectType({ description: 'The character details.' })
export class Character {
  @Field(() => Int, { description: 'The ID of the character.' })
  id: number

  @Field({ description: 'The name of the character.' })
  name: string

  @Field({ description: 'The description of the character.' })
  description: string

  @Field(() => CharacterProperties, { description: 'The properties of the character.' })
  properties: CharacterProperties

  @Field(() => [CharacterGraded], { description: 'The graded data of the character.' })
  graded: CharacterGraded[]
}
