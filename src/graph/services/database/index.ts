import { registerDatabaseGraphQLResolvers } from '@/collection'
import './enums'
import { CharacterResolver, EquipmentResolver, SkillResolver } from './resolvers'

registerDatabaseGraphQLResolvers([CharacterResolver, EquipmentResolver, SkillResolver])
