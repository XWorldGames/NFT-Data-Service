import { ID as COLLECTION_ID } from '@/collections/1'
import { DataRepository as CharacterDataRepository } from '@/collections/1/repositories/data.repository'
import { IntComparisonExpression, StringComparisonExpression } from '@/graph/inputs'
import { compileFilterInput } from '@/graph/utils'
import { DataRepository } from '@repositories/data.repository'
import { Arg, Args, ArgsType, Field, InputType, Int, Query, Resolver } from 'type-graphql'
import { Container } from 'typedi'
import { SkillFilter } from '../filters'
import { CharacterClassComparisonExpression, CharacterRaceComparisonExpression } from '../inputs'
import { Character } from '../types'

@InputType({ description: "The properties filter of the character's graded data." })
class CharacterGradedPropertyFilter {
  @Field(() => IntComparisonExpression, { nullable: true, description: "The base attack time comparison expression of the character's graded data." })
  base_attack_time?: number
}

@InputType({ description: 'The graded data filter of the character.' })
class CharacterGradedFilter {
  @Field(() => IntComparisonExpression, { nullable: true, description: "The level comparison expression of the character's grade." })
  level?: number

  @Field(() => CharacterGradedPropertyFilter, { nullable: true, description: "The properties filter of the character's graded data." })
  properties?: CharacterGradedPropertyFilter
}

@InputType({ description: 'The character property filter.' })
class CharacterPropertyFilter {
  @Field(() => CharacterClassComparisonExpression, { nullable: true, description: 'The class comparison expression of the character.' })
  class?: CharacterClassComparisonExpression

  @Field(() => CharacterRaceComparisonExpression, { nullable: true, description: 'The race comparison expression of the character.' })
  race?: CharacterRaceComparisonExpression

  @Field(() => IntComparisonExpression, { nullable: true, description: "The health value comparison expression of the character's base stats." })
  health?: IntComparisonExpression

  @Field(() => IntComparisonExpression, { nullable: true, description: "The attack value comparison expression of the character's base stats." })
  attack?: IntComparisonExpression

  @Field(() => IntComparisonExpression, { nullable: true, description: "The combat power comparison expression of the character's base stats." })
  combat_power?: IntComparisonExpression

  @Field(() => SkillFilter, { nullable: true, description: 'The skills filter of the character.' })
  skills?: SkillFilter
}

@InputType({ description: 'The characters filter.' })
class CharactersFilter {
  @Field(() => [CharactersFilter], { nullable: true, description: 'The AND filter.' })
  _and?: CharactersFilter[]

  @Field(() => [CharactersFilter], { nullable: true, description: 'The OR filter.' })
  _or?: CharactersFilter[]

  @Field(() => CharactersFilter, { nullable: true, description: 'The NOT filter.' })
  _not?: CharactersFilter

  @Field(() => IntComparisonExpression, { nullable: true, description: 'The ID comparison expression of the character.' })
  id?: IntComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: 'The name comparison expression of the character.' })
  name?: StringComparisonExpression

  @Field(() => StringComparisonExpression, { nullable: true, description: 'The description comparison expression of the character.' })
  description?: StringComparisonExpression

  @Field(() => CharacterPropertyFilter, { nullable: true, description: 'The properties filter of the character.' })
  properties?: CharacterPropertyFilter

  @Field(() => CharacterGradedFilter, { nullable: true, description: 'The graded data filter of the character.' })
  graded?: CharacterGradedFilter
}

@ArgsType()
class CharactersQuery {
  @Field(() => Int, { nullable: true })
  skip?: number

  @Field(() => Int, { nullable: true })
  take?: number

  @Field(() => CharactersFilter, { nullable: true, description: 'The characters filter.' })
  filter?: CharactersFilter
}

@Resolver()
export class CharacterResolver {
  private readonly repository: CharacterDataRepository

  constructor() {
    this.repository = Container.get(DataRepository).getProvider(COLLECTION_ID)
  }

  @Query(() => Character, { description: 'Get a character by given ID.' })
  async character(@Arg('id', () => Int) id: number) {
    const result = this.repository.findCompleteCharacterById(id)
    if (!result) {
      throw new Error('The resource cannot be found.')
    }
    return result
  }

  @Query(() => [Character], { description: 'Get characters by query statements.' })
  async characters(@Args() query?: CharactersQuery) {
    const { take, skip, filter } = query ?? {}
    if (filter) {
      try {
        const match = compileFilterInput(filter)
        return this.repository.findCompleteCharacters({ match, take, skip })
      } catch (_) {
        return []
      }
    }
    return this.repository.findCompleteCharacters({ take, skip })
  }
}
