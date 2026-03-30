import { Client, ActivityType } from 'discord.js'
import { Db } from 'mongodb'
import { logger } from '../utils/logger'

export default {
  name: 'clientReady',
  once: true,
  async execute(client: Client, db: Db) {
    logger.success(`Logged in as ${client.user!.username}`)

    // Apply saved bot status
    try {
      const savedStatus = await db.collection('config').findOne({ key: 'botstatus' })
      if (savedStatus?.activityText) {
        const activityTypes: Record<string, ActivityType> = {
          PLAYING: ActivityType.Playing,
          STREAMING: ActivityType.Streaming,
          LISTENING: ActivityType.Listening,
          WATCHING: ActivityType.Watching,
          COMPETING: ActivityType.Competing,
          CUSTOM: ActivityType.Custom,
        }
        const type = activityTypes[savedStatus.activityType] ?? ActivityType.Playing
        const activity: { name: string; type: ActivityType; url?: string } = {
          name: savedStatus.activityText,
          type,
        }
        if (savedStatus.activityType === 'STREAMING' && savedStatus.streamUrl) {
          activity.url = savedStatus.streamUrl
        }
        client.user!.setPresence({ status: savedStatus.presence || 'online', activities: [activity] })
        logger.info(`Status: ${savedStatus.activityType} ${savedStatus.activityText}`)
      }
    } catch (err: unknown) {
      logger.error(`Failed to set status: ${(err as Error).message}`)
    }

    // Record uptime
    await db.collection('config').updateOne(
      { key: 'uptime' },
      { $set: { key: 'uptime', since: new Date() } },
      { upsert: true }
    )

    logger.info('Use Register Commands in the dashboard to register slash commands.')
  },
}
