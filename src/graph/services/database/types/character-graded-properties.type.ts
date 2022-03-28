import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType({ description: "The properties of the character's graded data." })
export class CharacterGradedProperties {
  @Field(() => Int, { description: 'The attack time of the character.' })
  base_attack_time: number
}
