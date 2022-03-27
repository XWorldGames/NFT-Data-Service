import { registerDatabaseGraphQLResolvers } from '@/collection'
import { CharacterResolver, EquipmentResolver, SkillResolver } from './resolvers'

registerDatabaseGraphQLResolvers([CharacterResolver, EquipmentResolver, SkillResolver])
