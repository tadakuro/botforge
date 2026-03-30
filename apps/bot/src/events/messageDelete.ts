import { Message, PartialMessage } from 'discord.js'
import { Db } from 'mongodb'
import { onMessageDelete } from '../modules/logging'

export default {
  name: 'messageDelete',
  once: false,
  async execute(_client: unknown, db: Db, message: Message | PartialMessage) {
    if (message.partial) return
    await onMessageDelete(message as Message, db)
  },
}
