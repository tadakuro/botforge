import { Db } from 'mongodb'

export async function getBotConfig(db: Db) {
  return db.collection('config').findOne({ key: 'bot' })
}

export async function getBotStatus(db: Db) {
  return db.collection('config').findOne({ key: 'botstatus' })
}

export async function setUptime(db: Db): Promise<void> {
  await db.collection('config').updateOne(
    { key: 'uptime' },
    { $set: { key: 'uptime', since: new Date() } },
    { upsert: true }
  )
}
