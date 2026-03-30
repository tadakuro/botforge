import { Client } from 'discord.js'
import { Db } from 'mongodb'
import { logger } from '../utils/logger'

import readyEvent from '../events/ready'
import messageCreateEvent from '../events/messageCreate'
import messageDeleteEvent from '../events/messageDelete'
import messageUpdateEvent from '../events/messageUpdate'
import interactionCreateEvent from '../events/interactionCreate'
import guildMemberAddEvent from '../events/guildMemberAdd'
import guildMemberRemoveEvent from '../events/guildMemberRemove'
import guildMemberUpdateEvent from '../events/guildMemberUpdate'
import guildBanAddEvent from '../events/guildBanAdd'
import guildBanRemoveEvent from '../events/guildBanRemove'
import voiceStateUpdateEvent from '../events/voiceStateUpdate'
import roleCreateEvent from '../events/roleCreate'
import roleDeleteEvent from '../events/roleDelete'
import channelCreateEvent from '../events/channelCreate'
import channelDeleteEvent from '../events/channelDelete'

const events = [
  readyEvent, messageCreateEvent, messageDeleteEvent, messageUpdateEvent,
  interactionCreateEvent, guildMemberAddEvent, guildMemberRemoveEvent,
  guildMemberUpdateEvent, guildBanAddEvent, guildBanRemoveEvent,
  voiceStateUpdateEvent, roleCreateEvent, roleDeleteEvent,
  channelCreateEvent, channelDeleteEvent,
]

export function loadEvents(client: Client, db: Db): void {
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, db, ...args))
    } else {
      client.on(event.name, (...args) => event.execute(client, db, ...args))
    }
    logger.info(`Loaded event: ${event.name}`)
  }
}
