import { registerEnumType } from 'type-graphql'

export enum EquipmentSlot {
  Weapon = 1,
  Armor,
}

registerEnumType(EquipmentSlot, {
  name: 'EquipmentSlot',
  description: 'The equipment slots',
})
