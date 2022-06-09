import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { DataRepository as CharacterDataRepository } from '@/collections/1/repositories/data.repository'
import { Grade } from '@/enums'
import { Container, Service } from 'typedi'
import id from '../id'

type Token = {
  id: number
  name: string
  description: string
  properties: object
}

@Service()
export class DataRepository extends AbstractDataRepository {
  private characterData: CharacterDataRepository

  constructor() {
    super(id)
    this.characterData = Container.get(CharacterDataRepository)
  }

  public findTokenDataById(tokenId: number): Token {
    const identifier = (tokenId & 0xffff) + 100000000
    const element = (tokenId >> 16) & 0xff
    const grade = (tokenId >> 24) & 0xff

    const character = this.characterData.findCharacterById(identifier)
    if (character) {
      return {
        id: tokenId,
        name: `${character.name} Piece (${Grade[grade]})`,
        description: '',
        properties: {
          name: character.name,
          identifier,
          element,
          grade,
        },
      }
    }
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    //
  }
}
