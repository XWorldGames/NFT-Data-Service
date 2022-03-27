import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType({ description: "The properties of the equipment's graded data." })
export class EquipmentGradedProperties {
  @Field(() => Int, { description: 'The health value added by equipment.' })
  health: number

  @Field(() => Int, { description: 'The defense value added by equipment.' })
  defense: number

  @Field(() => Int, { description: 'The attack value added by equipment.' })
  attack: number
}
