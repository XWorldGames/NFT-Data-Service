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
    class: number
    part: number
    level: number
    star: number
    generation: number
    experience: number
    health: number
    attack: number
    defense: number
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

    const gear = this.dataRepository.findGearByTokenClassAndClassGearId(Number(metadata.role), Number(metadata.equip))
    if (!gear) {
      return null
    }

    const grade = Number(metadata.grade)
    const level = Number(metadata.level)
    const experience = Number(metadata.exp)
    const star = level % 5
    const generation = Math.floor(level / 5)
    const { properties } = gear.graded.find(item => item.level === grade)
    const health = properties.health
    const defense = properties.defense
    const attack = properties.attack
    const characterClass = gear.properties.class
    const part = gear.properties.part

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = gear.id
      code = gear.code
      name = gear.name
      event = gear.event
      special = gear.special
      animated = gear.animated
      properties = {
        class: characterClass,
        part,
        grade,
        level,
        star,
        generation,
        experience,
        health,
        attack,
        defense,
      }
    })()
  }

  mock(identifier: number, data: any): ITokenMetadata | null {
    const gear = this.dataRepository.findGearById(identifier)
    if (!gear) {
      return null
    }

    const grade = data.grade || 1
    const level = data.level || 1
    const experience = 0
    const star = level % 5
    const generation = Math.floor(level / 5)
    const { properties } = gear.graded.find(item => item.level === grade)
    const health = properties.health
    const defense = properties.defense
    const attack = properties.attack
    const characterClass = gear.properties.class
    const part = gear.properties.part

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = gear.id
      code = gear.code
      name = gear.name
      event = gear.event
      special = gear.special
      animated = gear.animated
      properties = {
        class: characterClass,
        part,
        grade,
        level,
        star,
        generation,
        experience,
        health,
        attack,
        defense,
      }
    })()
  }
}
