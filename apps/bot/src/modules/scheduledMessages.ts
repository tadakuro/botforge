import { Client } from 'discord.js'
import { Db } from 'mongodb'

export function initScheduledMessages(client: Client, db: Db): void {
  setInterval(async () => {
    const now = new Date()
    const due = await db.collection('scheduled_messages').find({ sent: false, scheduledAt: { $lte: now } }).toArray()
    for (const msg of due) {
      try {
        let channel = null
        for (const guild of client.guilds.cache.values()) {
          const ch = guild.channels.cache.get(msg.channelId as string)
          if (ch && 'send' in ch) { channel = ch as { send(m: string): Promise<void> }; break }
        }
        if (!channel) {
          await db.collection('scheduled_messages').updateOne({ _id: msg._id }, { $set: { sent: true, error: 'Channel not found' } })
          continue
        }
        await channel.send(msg.message as string)
        if (!msg.repeat || msg.repeat === 'none') {
          await db.collection('scheduled_messages').updateOne({ _id: msg._id }, { $set: { sent: true } })
        } else {
          const intervals: Record<string, number> = { hourly: 3600000, daily: 86400000, weekly: 604800000 }
          const next = new Date(now.getTime() + (intervals[msg.repeat as string] || 86400000))
          await db.collection('scheduled_messages').updateOne({ _id: msg._id }, { $set: { scheduledAt: next } })
        }
      } catch (err: unknown) {
        console.error('Scheduled message error:', (err as Error).message)
      }
    }
  }, 30000)
}
