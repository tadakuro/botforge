import { GuildBan } from 'discord.js'
import { Db } from 'mongodb'
import { onBanRemove } from '../modules/logging'

export default {
  name: 'guildBanRemove',
  once: false,
  async execute(_client: unknown, db: Db, ban: GuildBan) {
    await onBanRemove(ban, db)
  },
}
