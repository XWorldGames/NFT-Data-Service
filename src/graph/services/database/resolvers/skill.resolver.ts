import { ID as COLLECTION_ID } from '@/collections/1'
import { DataRepository as CharacterDataRepository } from '@/collections/1/repositories/data.repository'
import { compileFilterInput } from '@/graph/utils'
import { DataRepository } from '@repositories/data.repository'
import { Arg, Args, ArgsType, Field, InputType, Int, Query, Resolver } from 'type-graphql'
import { Container } from 'typedi'
import { SkillFilter } from '../filters'
import { Skill } from '../types'

@InputType({ description: 'The skills filter.' })
class SkillsFilter extends SkillFilter {
  @Field(() => [SkillsFilter], { nullable: true, description: 'The AND filter.' })
  _and?: SkillsFilter[]

  @Field(() => [SkillsFilter], { nullable: true, description: 'The OR filter.' })
  _or?: SkillsFilter[]

  @Field(() => SkillsFilter, { nullable: true, description: 'The NOT filter.' })
  _not?: SkillsFilter
}

@ArgsType()
class SkillsQuery {
  @Field(() => Int, { nullable: true })
  skip?: number

  @Field(() => Int, { nullable: true })
  take?: number

  @Field(() => SkillsFilter, { nullable: true, description: 'The skills filter.' })
  filter?: SkillsFilter
}

@Resolver()
export class SkillResolver {
  private readonly repository: CharacterDataRepository

  constructor() {
    this.repository = Container.get(DataRepository).getProvider(COLLECTION_ID)
  }

  @Query(() => Skill, { description: 'Get a skill by given ID.' })
  async skill(@Arg('id', () => Int) id: number) {
    return this.repository.findSkillById(id)
  }

  @Query(() => [Skill], { description: 'Get skills by query statements.' })
  async skills(@Args() query?: SkillsQuery) {
    const { take, skip, filter } = query ?? {}
    if (filter) {
      try {
        const match = compileFilterInput(filter)
        return this.repository.findSkills({ match, take, skip })
      } catch (_) {
        return []
      }
    }
    return this.repository.findSkills({ take, skip })
  }
}
