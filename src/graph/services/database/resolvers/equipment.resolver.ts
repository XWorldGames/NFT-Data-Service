import { ID as COLLECTION_ID } from '@/collections/2'
import { DataRepository as EquipmentDataRepository } from '@/collections/2/repositories/data.repository'
import { IntComparisonExpression, StringComparisonExpression } from '@/graph/inputs'
import { compileFilterInput } from '@/graph/utils'
import { DataRepository } from '@repositories/data.repository'
import { Arg, Args, ArgsType, Field, InputType, Int, Query, Resolver } from 'type-graphql'
import { Container } from 'typedi'
import { CharacterClassComparisonExpression, EquipmentSlotComparisonExpression } from '../inputs'
import { Equipment } from '../types'

@InputType({ description: "The properties filter of the equipment's graded data." })
class EquipmentGradedPropertyFilter {
  @Field(() => IntComparisonExpression, { nullable: true, description: "The health value comparison expression of the equipment's graded data." })
  health?: number

  @Field(() => IntComparisonExpression, { nullable: true, description: "The defense value comparison expression of the equipment's graded data." })
  defense?: number

  @Field(() => IntComparisonExpression, { nullable: true, description: "The attack value comparison expression of the equipment's graded data." })
  attack?: number
}

@InputType({ description: 'The graded data filter of the equipment.' })
class EquipmentGradedFilter {
  @Field(() => IntComparisonExpression, { nullable: true, description: "The level comparison expression of the equipment's grade." })
  level?: number

  @Field(() => EquipmentGradedPropertyFilter, { nullable: true, description: "The properties filter of the equipment's graded data." })
  properties?: EquipmentGradedPropertyFilter
}

@InputType({ description: 'The equipment property filter.' })
class EquipmentPropertyFilter {
  @Field(() => CharacterClassComparisonExpression, { nullable: true, description: 'The class comparison expression of the equipment.' })
  class?: CharacterClassComparisonExpression

  @Field(() => EquipmentSlotComparisonExpression, { nullable: true, description: 'The race comparison expression of the equipment.' })
  slot?: EquipmentSlotComparisonExpression
}

@InputType({ description: 'The equipments filter.' })
class EquipmentsFilter {
  @Field(() => [EquipmentsFilter], { nullable: true, description: 'The AND filter.' })
  _and?: EquipmentsFilter[]

  @Field(() => [EquipmentsFilter], { nullable: true, description: 'The OR filter.' })
  _or?: EquipmentsFilter[]

  @Field(() => EquipmentsFilter, { nullable: true, description: 'The NOT filter.' })
  _not?: EquipmentsFilter

  @Field(() => IntComparisonExpression, { nullable: true, description: 'The ID comparison expression of the equipment.' })
  id?: IntComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: 'The name comparison expression of the equipment.' })
  name?: StringComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: 'The description comparison expression of the equipment.' })
  description?: StringComparisonExpression

  @Field(() => EquipmentPropertyFilter, { nullable: true, description: 'The properties filter of the equipment.' })
  properties?: EquipmentPropertyFilter

  @Field(() => EquipmentGradedFilter, { nullable: true, description: 'The graded data filter of the equipment.' })
  graded?: EquipmentGradedFilter
}

@ArgsType()
class EquipmentsQuery {
  @Field(() => Int, { nullable: true })
  skip?: number

  @Field(() => Int, { nullable: true })
  take?: number

  @Field(() => EquipmentsFilter, { nullable: true, description: 'The equipments filter.' })
  filter?: EquipmentsFilter
}

@Resolver()
export class EquipmentResolver {
  private readonly repository: EquipmentDataRepository

  constructor() {
    this.repository = Container.get(DataRepository).getProvider(COLLECTION_ID)
  }

  @Query(() => Equipment, { description: 'Get an equipment by given ID.' })
  async equipment(@Arg('id', () => Int) id: number) {
    return this.repository.findEquipmentById(id)
  }

  @Query(() => [Equipment], { description: 'Get equipments by query statements.' })
  async equipments(@Args() query?: EquipmentsQuery) {
    const { take, skip, filter } = query ?? {}
    if (filter) {
      try {
        const match = compileFilterInput(filter)
        return this.repository.findEquipments({ match, take, skip })
      } catch (_) {
        return []
      }
    }
    return this.repository.findEquipments({ take, skip })
  }
}
