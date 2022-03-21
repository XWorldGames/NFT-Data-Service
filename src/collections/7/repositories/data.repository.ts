import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

export interface ITalent {
  id: number
  collection: number
  code: string
  name: string
  description: string
  special: boolean
  event: number | null
  animated: boolean
  properties: {
    kind: number
  }
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private equipments: ITalent[]

  constructor() {
    super(id)
    this.loadData()
  }

  findTalentById(id: number): ITalent | undefined {
    return this.equipments.find(item => item.id === id)
  }

  findTalentByCode(code: string): ITalent | undefined {
    return this.equipments.find(item => item.code === code)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.equipments = readJsonFileSync(this.resourceDataDir, 'talents.json')
  }
}
