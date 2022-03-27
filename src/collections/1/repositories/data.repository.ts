import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { cloneDeep } from 'lodash'
import { Service } from 'typedi'
import id from '../id'

export interface ICharacterSkill {
  id: number
  name: string
  code?: string
  level: { index: number; value: number; code?: string }[]
}

export interface IBaseCharacter<Complete extends boolean> {
  id: number
  collection: number
  code: string
  name: string
  description: string
  special: boolean
  event: number | null
  animated: boolean
  properties: {
    class: number
    race: number
    health: number
    attack: number
    combat_power: number
    skills: Complete extends true
      ? ISkill[] & {
          v1: [ISkill[], ISkill[], ISkill[], ISkill[]]
          v2: [ISkill, ISkill]
        }
      : {
          '1': [ICharacterSkill[], ICharacterSkill[], ICharacterSkill[], ICharacterSkill[]]
          '2': [ICharacterSkill, ICharacterSkill]
        }
  }
  graded: {
    level: number
    properties: {
      attack_time: number
    }
  }[]
}

export type ICharacter = IBaseCharacter<false>

export type ICompleteCharacter = IBaseCharacter<true>

export interface ISkill {
  id: number
  version: '1' | '2'
  name: string
  type: number
  code?: string
  effects: {
    code?: string
    level: number
    description: string
  }[]
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private characters: ICharacter[]
  private completeCharacters: ICompleteCharacter[]
  private skills: {
    '1': ISkill[]
    '2': ISkill[]
  } = {
    1: [],
    2: [],
  }

  constructor() {
    super(id)
    this.loadData()
  }

  findCharacters(query?: { match?: (value: any) => boolean; take?: number; skip?: number }): ICompleteCharacter[] {
    const { match, skip, take } = query ?? {}
    let characters = this.completeCharacters
    if (match) {
      characters = characters.filter(character => match(character))
    }
    const start = skip ?? 0
    const end = Math.min((take ?? characters.length) + start, characters.length)
    return characters.slice(start, end)
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

  findSkills(query?: { match?: (value: any) => boolean; take?: number; skip?: number }): ISkill[] {
    const { match, skip, take } = query ?? {}
    let skills = [].concat(this.skills[1], this.skills[2])
    if (match) {
      skills = skills.filter(skill => match(skill))
    }
    const start = skip ?? 0
    const end = Math.min((take ?? skills.length) + start, skills.length)
    return skills.slice(start, end)
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

  findVersion2SkillByCode(code: string) {
    return this.skills['2'].find(item => item.code === code)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.characters = readJsonFileSync(this.resourceDataDir, 'characters.json')
    this.skills['1'] = readJsonFileSync(this.resourceDataDir, 'skills-1.json')
    this.skills['2'] = readJsonFileSync(this.resourceDataDir, 'skills-2.json')

    const skills = cloneDeep(this.skills)
    const characters = cloneDeep(this.characters)
    characters.forEach(character => {
      const v1Skills = character.properties.skills['1'].map(slot => slot.map(skill => skills['1'].find(s => s.id === skill.id)))
      const v2Skills = character.properties.skills['2'].map(skill => skills['2'].find(s => s.id === skill.id))
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      character.properties.skills = [].concat(v1Skills, v2Skills)
      character.properties.skills['v1'] = v1Skills
      character.properties.skills['v2'] = v2Skills
    })
    this.completeCharacters = characters as unknown as ICompleteCharacter[]
  }
}
