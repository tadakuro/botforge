import { GuildMember } from 'discord.js'
import { Db } from 'mongodb'
import { handleWelcome } from '../modules/welcome'
import { handleAutoRoles } from '../modules/autoRoles'
import { onMemberJoin } from '../modules/logging'

export default {
  name: 'guildMemberAdd',
  once: false,
  async execute(_client: unknown, db: Db, member: GuildMember) {
    await handleWelcome(member, db)
    await handleAutoRoles(member, db)
    await onMemberJoin(member, db)
  },
}
