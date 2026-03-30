import { Role } from 'discord.js'
import { Db } from 'mongodb'
import { onRoleDelete } from '../modules/logging'
export default { name: 'roleDelete', once: false,
  async execute(_c: unknown, db: Db, role: Role) { await onRoleDelete(role, db) } }
