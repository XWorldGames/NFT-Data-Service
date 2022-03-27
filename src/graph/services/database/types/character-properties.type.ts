import { Field, Int, ObjectType } from 'type-graphql'
import { CharacterClass, CharacterRace } from '../enums'
import { CharacterPropertiesSkills } from './character-properties-skills.type'

@ObjectType({ description: 'The properties of the character.' })
export class CharacterProperties {
  @Field(() => CharacterClass, { nullable: true, description: 'The class of the character.' })
  class?: CharacterClass

  @Field(() => CharacterRace, { nullable: true, description: 'The race of the character.' })
  race?: CharacterRace

  @Field(() => Int, { description: "The health value of the character's base stats." })
  health: number

  @Field(() => Int, { description: "The attack value of the character's base stats." })
  attack: number

  @Field(() => Int, { description: "The combat power of the character's base stats." })
  combat_power: number

  @Field(() => CharacterPropertiesSkills, { description: 'The skills the character.' })
  skills: CharacterPropertiesSkills
}
