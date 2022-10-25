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

export interface IBaseMedia {
  id: number
  collection: number
  code: string
  name: string
  description: string
  special: boolean
  event: number | null
  animated: boolean
  properties: {
    type: number
    id: number
    url: string
  }
}

export type ICharacter = IBaseCharacter
export type IMedia = IBaseMedia

@Service()
export class DataRepository extends AbstractDataRepository {
  private characters: ICharacter[]
  private media: IMedia[]

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

  findMediaById(id: number): IMedia | undefined {
    return this.media.find(item => item.id === id)
  }

  findMediaByCode(code: string): IMedia | undefined {
    return this.media.find(item => item.code === code)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.characters = readJsonFileSync(this.resourceDataDir, 'characters.json')
    this.media = readJsonFileSync(this.resourceDataDir, 'media.json')
  }
}
