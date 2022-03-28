import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  properties: {
    identifier: number
    grade: number
    star: number
    generation: number
    element: number
    experience: number
    health: number
    attack: number
    attack_time: number
    win: number
    lose: number
    skills: { [k: string]: { identifier: number; name: string; level: number }[] }
  }
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
        element,
        experience,
        health,
        attack,
        attack_time: character.graded.find(item => item.level === grade).properties.base_attack_time,
        skills,
        win,
        lose,
      }
    })()
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
        element,
        experience,
        health,
        attack,
        attack_time: character.graded.find(item => item.level === grade).properties.base_attack_time,
        skills,
        win,
        lose,
      }
    })()
  }
}
