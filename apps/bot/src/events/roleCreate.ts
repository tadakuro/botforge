import { Role } from 'discord.js'
import { Db } from 'mongodb'
import { onRoleCreate } from '../modules/logging'
export default { name: 'roleCreate', once: false,
  async execute(_c: unknown, db: Db, role: Role) { await onRoleCreate(role, db) } }
