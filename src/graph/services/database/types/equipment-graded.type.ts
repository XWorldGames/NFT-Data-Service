import { Field, Int, ObjectType } from 'type-graphql'
import { EquipmentGradedProperties } from './equipment-graded-properties.type'

@ObjectType({ description: 'The graded data of the equipment.' })
export class EquipmentGraded {
  @Field(() => Int, { description: "The level of the equipment's grade." })
  level: number

  @Field(() => EquipmentGradedProperties, { description: "The properties of the equipment's graded data." })
  properties: EquipmentGradedProperties
}
