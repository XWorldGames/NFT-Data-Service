import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  name: string
  properties: {
    grade: number
    star: number
    generation: number
    element: number
    experience: number
    health: number
    attack: number
    base_attack_time: number
  }
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, metadata: any): ITokenMetadata | null {
    if (!metadata) {
      return null
    }

    const character = this.dataRepository.findCharacterByTokenRepositoryId(Number(metadata.role[0]))
    if (!character) {
      return null
    }

    const grade = Number(metadata.grade)
    const star = Number(metadata.role[2])
    const generation = Number(metadata.role[1])
    const experience = Number(metadata.role[3])
    const element = Number(metadata.fiveElement)
    const health = Number(metadata.role[4])
    const attack = Number(metadata.role[5])

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = character.id
      code = character.code
      name = character.name
      event = character.event
      special = character.special
      animated = character.animated
      properties = {
        grade,
        star,
        generation,
        element,
        experience,
        health,
        attack,
        base_attack_time: character.graded.find(item => item.level === grade).properties.base_attack_time,
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

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = character.id
      code = character.code
      name = character.name
      event = character.event
      special = character.special
      animated = character.animated
      properties = {
        grade,
        star,
        generation,
        element,
        experience,
        health,
        attack,
        base_attack_time: character.graded.find(item => item.level === grade).properties.base_attack_time,
      }
    })()
  }
}
