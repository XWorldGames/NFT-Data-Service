import { CharacterClass, EquipmentSlot, Grade } from '@/enums'
import { ITokenMetadata as ITokenMetadataBase } from '@/interfaces/token-metadata.interface'
import { ITokenMetadataNormalizer } from '@/interfaces/token-metadata.normalizer.interface'
import { isEmpty } from '@utils/util'
import { Inject, Service } from 'typedi'
import id from '../id'
import { DataRepository } from '../repositories/data.repository'

export interface ITokenMetadataProperties {
  identifier: number
  grade: number
  class: number
  slot: number
  level: number
  star: number
  generation: number
  experience: number
  health: number
  attack: number
  defense: number
}

export interface ITokenMetadata extends ITokenMetadataBase {
  code: string
  name: string
  properties: ITokenMetadataProperties
}

@Service()
export class TokenMetadataNormalizer implements ITokenMetadataNormalizer {
  @Inject()
  private readonly dataRepository: DataRepository

  normalize(tokenId: number, data: any): ITokenMetadata | null {
    if (isEmpty(data) || Number(data.role) === 0) {
      return null
    }

    const equipment = this.dataRepository.findEquipmentByTokenClassAndClassEquipmentId(Number(data.role), Number(data.equip))
    if (!equipment) {
      return null
    }

    const grade = Number(data.grade)
    const level = Number(data.level)
    const experience = Number(data.exp)
    const star = level % 5 || 5
    const generation = Math.ceil(level / 5)
    const { properties } = equipment.graded.find(item => item.level === grade)
    const health = properties.health
    const defense = properties.defense
    const attack = properties.attack
    const characterClass = equipment.properties.class
    const slot = equipment.properties.slot

    return new (class implements ITokenMetadata {
      id = Number(tokenId)
      collection_id = id
      identifier = equipment.id
      code = equipment.code
      name = `${equipment.name}`
      description = equipment.description
      event = equipment.event
      special = equipment.special
      animated = equipment.animated
      properties = {
        identifier: equipment.id,
        class: characterClass,
        slot,
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
        trait_type: 'Slot',
        value: EquipmentSlot[properties.slot],
      },
      {
        display_type: 'number',
        trait_type: 'Level',
        value: properties.level,
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
        trait_type: 'Defense',
        value: properties.defense,
      },
    ]
  }

  mock(identifier: number, data: any): ITokenMetadata | null {
    const equipment = this.dataRepository.findEquipmentById(identifier)
    if (!equipment) {
      return null
    }

    const grade = data.grade || 1
    const level = data.level || 1
    const experience = 0
    const star = level % 5
    const generation = Math.ceil(level / 5)
    const { properties } = equipment.graded.find(item => item.level === grade)
    const health = properties.health
    const defense = properties.defense
    const attack = properties.attack
    const characterClass = equipment.properties.class
    const slot = equipment.properties.slot

    return new (class implements ITokenMetadata {
      id = 0
      collection_id = id
      identifier = equipment.id
      code = equipment.code
      name = equipment.name
      description = equipment.description
      event = equipment.event
      special = equipment.special
      animated = equipment.animated
      properties = {
        identifier: equipment.id,
        class: characterClass,
        slot,
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
