import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { Service } from 'typedi'
import id from '../id'

@Service()
export class DataRepository extends AbstractDataRepository {
  constructor() {
    super(id)
    this.loadData()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    //
  }
}
