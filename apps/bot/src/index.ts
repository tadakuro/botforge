import 'dotenv/config'
import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { connectDb } from '@botforge/database'
import { loadEvents } from './handlers/eventHandler'
import { initPolls } from './modules/polls'
import { initGiveaways } from './modules/giveaways'
import { initScheduledMessages } from './modules/scheduledMessages'
import { initReactionRoles } from './modules/reactionRoles'
import { refreshCommandCache } from './modules/tracker'
import { invalidateLoggingCache } from './modules/logging'
import { logger } from './utils/logger'

async function main() {
  const db = await connectDb()
  logger.success('Connected to MongoDB')

  const config = await db.collection('config').findOne({ key: 'bot' })
  if (!config?.token) {
    logger.error('No bot token in database. Connect via the dashboard first.')
    process.exit(1)
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.Channel],
  })

  // Load all event handlers
  loadEvents(client, db)

  // Init interval-based modules
  initPolls(client, db)
  initGiveaways(client, db)
  initScheduledMessages(client, db)
  initReactionRoles(client, db)

  // Init caches
  invalidateLoggingCache()
  await refreshCommandCache(db)
  setInterval(() => refreshCommandCache(db), 120000)

  await client.login(config.token as string)
}

main().catch(err => {
  logger.error(`Fatal: ${(err as Error).message}`)
  process.exit(1)
})
