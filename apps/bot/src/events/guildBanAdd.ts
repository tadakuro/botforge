import { GuildBan } from 'discord.js'
import { Db } from 'mongodb'
import { onBanAdd } from '../modules/logging'

export default {
  name: 'guildBanAdd',
  once: false,
  async execute(_client: unknown, db: Db, ban: GuildBan) {
    await onBanAdd(ban, db)
  },
}
