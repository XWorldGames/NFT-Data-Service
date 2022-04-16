import { EquipmentSlot } from '@/enums'
import { registerEnumType } from 'type-graphql'

registerEnumType(EquipmentSlot, {
  name: 'EquipmentSlot',
  description: 'The equipment slots',
})
