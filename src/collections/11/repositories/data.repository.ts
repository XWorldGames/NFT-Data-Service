import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

export interface IBaseCharacter {
  id: number
  collection: number
  code: string
  name: string
  description: string
  special: boolean
  event: number | null
  animated: boolean
  properties: object
}

export type ICharacter = IBaseCharacter

@Service()
export class DataRepository extends AbstractDataRepository {
  private characters: ICharacter[]

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
    return this.findCharacterByCode(String(id))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.characters = readJsonFileSync(this.resourceDataDir, 'characters.json')
  }
}
