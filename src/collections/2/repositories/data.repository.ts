import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

export interface IGear {
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
    slot: number
  }
  graded: {
    level: number
    properties: {
      health: number
      defense: number
      attack: number
    }
  }[]
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private gears: IGear[]

  constructor() {
    super(id)
    this.loadData()
  }

  findGearById(id: number): IGear | undefined {
    return this.gears.find(item => item.id === id)
  }

  findGearByCode(code: string): IGear | undefined {
    return this.gears.find(item => item.code === code)
  }

  findGearByTokenClassAndClassGearId(characterClass: number, classGearId: number): IGear | undefined {
    const code = Number('0x' + characterClass.toString(16).padStart(2, '0') + classGearId.toString(16).padStart(2, '0')).toString()
    return this.gears.find(item => item.code === code)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.gears = readJsonFileSync(this.resourceDataDir, 'gears.json')
  }
}
