import { Message, PartialMessage } from 'discord.js'
import { Db } from 'mongodb'
import { onMessageUpdate } from '../modules/logging'

export default {
  name: 'messageUpdate',
  once: false,
  async execute(_client: unknown, db: Db, oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
    if (oldMsg.partial || newMsg.partial) return
    await onMessageUpdate(oldMsg as Message, newMsg as Message, db)
  },
}
