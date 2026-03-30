import { Message } from 'discord.js'
import { Db } from 'mongodb'
import { handleAutomod } from '../modules/automod'

export default {
  name: 'messageCreate',
  once: false,
  async execute(_client: unknown, db: Db, message: Message) {
    if (message.author.bot || !message.guild) return
    await handleAutomod(message, db)
  },
}
