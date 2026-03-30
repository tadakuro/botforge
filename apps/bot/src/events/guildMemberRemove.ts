import { GuildMember, PartialGuildMember } from 'discord.js'
import { Db } from 'mongodb'
import { handleGoodbye } from '../modules/welcome'
import { onMemberLeave } from '../modules/logging'

export default {
  name: 'guildMemberRemove',
  once: false,
  async execute(_client: unknown, db: Db, member: GuildMember | PartialGuildMember) {
    if (member.partial) return
    await handleGoodbye(member as GuildMember, db)
    await onMemberLeave(member as GuildMember, db)
  },
}
