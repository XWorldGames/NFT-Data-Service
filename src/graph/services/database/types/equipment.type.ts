import { Field, Int, ObjectType } from 'type-graphql'
import { EquipmentGraded } from './equipment-graded.type'
import { EquipmentProperties } from './equipment-properties.type'

@ObjectType({ description: 'The equipment details.' })
export class Equipment {
  @Field(() => Int, { description: 'The ID of the equipment.' })
  id: number

  @Field({ description: 'The name of the equipment.' })
  name: string

  @Field({ description: 'The description of the equipment.' })
  description: string

  @Field(() => EquipmentProperties, { description: 'The properties of the equipment.' })
  properties: EquipmentProperties

  @Field(() => [EquipmentGraded], { description: 'The graded data of the equipment.' })
  graded: EquipmentGraded[]
}
