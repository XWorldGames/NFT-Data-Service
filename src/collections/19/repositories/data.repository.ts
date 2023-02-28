import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

export interface IBaseDatum {
  id: number
  collection: number
  name: string
  description: string
  properties: {
    showType: number
    character: number
    round: number
    seat: number
    seatType: number
  }
}

export type IDatum = IBaseDatum

@Service()
export class DataRepository extends AbstractDataRepository {
  private data: IDatum[]

  constructor() {
    super(id)
    this.loadData()
  }

  findById(id: number): IDatum | undefined {
    return this.data.find(item => item.id === id)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.data = readJsonFileSync(this.resourceDataDir, 'data.json')
  }
}
