import { EquipmentSlot } from '@/enums'
import { Field, InputType } from 'type-graphql'

@InputType()
export class EquipmentSlotComparisonExpression {
  @Field(() => EquipmentSlot, { nullable: true })
  _eq?: EquipmentSlot

  @Field(() => [EquipmentSlot], { nullable: true })
  _in?: EquipmentSlot[]

  @Field(() => EquipmentSlot, { nullable: true })
  _ne?: EquipmentSlot

  @Field(() => [EquipmentSlot], { nullable: true })
  _nin?: EquipmentSlot[]
}
