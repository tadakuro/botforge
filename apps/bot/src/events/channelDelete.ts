import { GuildChannel } from 'discord.js'
import { Db } from 'mongodb'
import { onChannelDelete } from '../modules/logging'
export default { name: 'channelDelete', once: false,
  async execute(_c: unknown, db: Db, channel: GuildChannel) { await onChannelDelete(channel, db) } }
