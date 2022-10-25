import { CharacterClass, CharacterRace, Element, Grade} from "@/enums"
import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  identifier: number
  grade: number
  star: number
  generation: number
  class: number
  race: number
  element: number
  experience: number
  health: number
  attack: number
  base_attack_time: number
  win: number
  lose: number
  skills: { [k: string]: { identifier: number; name: string; level: number }[] }
}

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data) || isEmpty(data.role)) {
      return null
    }

    const character = this.dataRepository.findCharacterByTokenRepositoryId(Number(data.role[0]))
    if (!character) {
      return null
    }

    const grade = Number(data.grade)
    const element = Number(data.fiveElement)
    const generation = Number(data.role[1])
    const star = Number(data.role[2])
    const experience = Number(data.role[3])
    const health = Number(data.role[4])
    const attack = Number(data.role[5])
    const win = Number(data.role[6])
    const lose = Number(data.role[7])

    const skills = {
      1: Array(4).fill(null),
      2: [],
    }
    data.skills.forEach((index, slot) => {
      index = index.toNumber()
      character.properties.skills['1'][slot].some(skill => {
        const level = skill.level.find(item => item.index === index)
        if (level === undefined) {
          return false
        }
        skills[1][slot] = {
          identifier: skill.id,
          name: skill.name,
          level: level.value,
        }
        return true
      })
    })

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = character.id
      code = character.code
      name = `${character.name} #${tokenId}`
      description = character.description
      event = character.event
      special = character.special
      animated = character.animated
      properties = {
        identifier: character.id,
        grade,
        star,
        generation,
        class: character.properties.class,
        race: character.properties.race,
        element,
        experience,
        health,
        attack,
        base_attack_time: character.graded.find(item => item.level === grade).properties.base_attack_time,
        skills,
        win,
        lose,
      }
    })()
  }

  transformAttributes(properties: ITokenMetadataProperties) {
    return [
      {
        display_type: 'number',
        trait_type: 'Identifier',
        value: properties.identifier,
      },
      {
        trait_type: 'Grade',
        value: Grade[properties.grade],
      },
      {
        display_type: 'number',
        trait_type: 'Generation',
        value: properties.generation,
      },
      {
        display_type: 'number',
        trait_type: 'Star',
        value: properties.star,
      },
      {
        trait_type: 'Class',
        value: CharacterClass[properties.class],
      },
      {
        trait_type: 'Race',
        value: CharacterRace[properties.race],
      },
      {
        trait_type: 'Element',
        value: Element[properties.element],
      },
      {
        display_type: 'number',
        trait_type: 'Experience',
        value: properties.experience,
      },
      {
        display_type: 'number',
        trait_type: 'Health',
        value: properties.health,
      },
      {
        display_type: 'number',
        trait_type: 'Attack',
        value: properties.attack,
      },
      {
        display_type: 'number',
        trait_type: 'Base Attack Time',
        value: properties.base_attack_time,
      },
      {
        trait_type: 'Skills',
        value: properties.skills,
      },
    ]
  }

  mock(identifier: number, data: any): ITokenMetadata {
    const character = this.dataRepository.findCharacterById(identifier)
    if (!character) {
      return null
    }

    const grade = data.grade || 1
    const star = data.star || 1
    const generation = data.generation || 1
    const experience = 0
    const element = data.element || 0
    const health = data.health || character.properties.health
    const attack = data.attack || character.properties.attack
    const win = 0
    const lose = 0
    const skills = { 1: [], 2: [] }

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = character.id
      code = character.code
      name = character.name
      description = character.description
      event = character.event
      special = character.special
      animated = character.animated
      properties = {
        identifier: character.id,
        grade,
        star,
        generation,
        class: character.properties.class,
        race: character.properties.race,
        element,
        experience,
        health,
        attack,
        base_attack_time: character.graded.find(item => item.level === grade).properties.base_attack_time,
        skills,
        win,
        lose,
      }
    })()
  }
}
