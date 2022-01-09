import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

export interface IAsset {
  id: number
  collection: number
  code: string
  name: string
  description: string
  special: boolean
  event: number | null
  animated: boolean
  properties: {
    grade: number
    dividend: number
  }
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private assets: IAsset[]

  constructor() {
    super(id)
    this.loadData()
  }

  findById(id: number): IAsset | undefined {
    return this.assets.find(item => item.id === id)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.assets = readJsonFileSync(this.resourceDataDir, 'assets.json')
  }
}
