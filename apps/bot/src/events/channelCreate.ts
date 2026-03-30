import { GuildChannel } from 'discord.js'
import { Db } from 'mongodb'
import { onChannelCreate } from '../modules/logging'
export default { name: 'channelCreate', once: false,
  async execute(_c: unknown, db: Db, channel: GuildChannel) { await onChannelCreate(channel, db) } }
