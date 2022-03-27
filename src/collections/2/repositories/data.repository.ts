import { AbstractDataRepository } from '@/abstracts/abstract.data.repository'
import { readJsonFileSync } from '@utils/filesystem'
import { Service } from 'typedi'
import id from '../id'
import { ICompleteCharacter } from "@/collections/1/repositories/data.repository";

export interface IEquipment {
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
  private equipments: IEquipment[]

  constructor() {
    super(id)
    this.loadData()
  }

  findEquipments(query?: { match?: (value: any) => boolean; take?: number; skip?: number }): IEquipment[] {
    const { match, skip, take } = query ?? {}
    let equipments = this.equipments
    if (match) {
      equipments = equipments.filter(character => match(character))
    }
    const start = skip ?? 0
    const end = Math.min((take ?? equipments.length) + start, equipments.length)
    return equipments.slice(start, end)
  }

  findEquipmentById(id: number): IEquipment | undefined {
    return this.equipments.find(item => item.id === id)
  }

  findEquipmentByCode(code: string): IEquipment | undefined {
    return this.equipments.find(item => item.code === code)
  }

  findEquipmentByTokenClassAndClassEquipmentId(characterClass: number, classEquipmentId: number): IEquipment | undefined {
    const code = Number('0x' + characterClass.toString(16).padStart(2, '0') + classEquipmentId.toString(16).padStart(2, '0')).toString()
    return this.equipments.find(item => item.code === code)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDataFileChange(filepath: string): void {
    this.loadData()
  }

  private loadData(): void {
    this.equipments = readJsonFileSync(this.resourceDataDir, 'equipments.json')
  }
}
