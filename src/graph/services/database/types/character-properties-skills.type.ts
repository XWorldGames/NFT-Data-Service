import { Field, ObjectType } from 'type-graphql'
import { Skill } from './skill.type'

@ObjectType({ description: 'The skills of the character.' })
export class CharacterPropertiesSkills {
  @Field(() => [[Skill]], { description: 'The skills of the character for the DreamCard 1.0.' })
  v1: Skill

  @Field(() => [Skill], { description: 'The skills of the character for the DreamCard 2.0.' })
  v2: Skill[]
}
