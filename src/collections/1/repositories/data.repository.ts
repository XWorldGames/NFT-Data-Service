import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

export interface ICharacterSkill {
  id: number
  name: string
}

export interface ICharacter {
  id: number
  collection: number
  code: string
  name: string
  description: string
  special: boolean
  event: number | null
  animated: boolean
  properties: {
    health: number
    attack: number
    combat_power: number
    skills: {
      '1': [ICharacterSkill[], ICharacterSkill[], ICharacterSkill[], ICharacterSkill[]]
      '2': []
    }
  }
  graded: {
    level: number
    properties: {
      base_attack_time: number
    }
  }[]
}

export interface ISkill {
  id: number
  version: '1'
  name: string
  type: 'PASSIVE' | 'ACTIVE'
  effects: {
    code: string
    level: number
    description: string
  }[]
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private characters: ICharacter[]
  private skills: {
    '1': ISkill[]
  } = {
    1: [],
  }

  constructor() {
    super(id)
    this.loadData()
  }

  findCharacterById(id: number): ICharacter | undefined {
    return this.characters.find(item => item.id === id)
  }

  findCharacterByCode(code: string): ICharacter | undefined {
    return this.characters.find(item => item.code === code)
  }

  findCharacterByTokenRepositoryId(id: number): ICharacter | undefined {
    return this.characters.find(item => Number(item.code.replace('COL', '')) === id)
  }

  findSkillById(id: number) {
    for (const version in this.skills) {
      const skill = this.skills[version].find(item => item.id === id)
      if (skill) {
        return skill
      }
    }
    return null
  }

  findVersion1SkillByCode(code: string) {
    return this.skills['1'].find(item => item.effects.some(item => item.code === code))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.characters = readJsonFileSync(this.resourceDataDir, 'characters.json')
    this.skills['1'] = readJsonFileSync(this.resourceDataDir, 'skills-1.json')
  }
}
