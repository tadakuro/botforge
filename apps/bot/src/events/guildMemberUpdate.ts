import { GuildMember, PartialGuildMember } from 'discord.js'
import { Db } from 'mongodb'
import { onMemberUpdate } from '../modules/logging'

export default {
  name: 'guildMemberUpdate',
  once: false,
  async execute(_client: unknown, db: Db, oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    if (oldMember.partial) return
    await onMemberUpdate(oldMember as GuildMember, newMember, db)
  },
}
