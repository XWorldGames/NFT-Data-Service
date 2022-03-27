import { Field, ObjectType } from 'type-graphql'
import { CharacterClass, EquipmentSlot } from '../enums'

@ObjectType({ description: 'The properties of the equipment.' })
export class EquipmentProperties {
  @Field(() => CharacterClass, { description: 'The character class that can be equipped.' })
  class: CharacterClass

  @Field(() => EquipmentSlot, { description: 'The slot of the equipment.' })
  slot: EquipmentSlot
}
