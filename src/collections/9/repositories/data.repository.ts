import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync, resolvePath } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'

type Token = {
  id: number
  name: string
  description: string
  properties: object
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private tokens: Token[]

  constructor() {
    super(id)
    this.loadData()
  }

  public getTokens(): Token[] {
    return this.tokens
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadTokens(): void {
    this.tokens = readJsonFileSync(resolvePath(this.resourceDataDir, 'tokens.json'))
  }

  private loadData(): void {
    this.loadTokens()
  }
}
