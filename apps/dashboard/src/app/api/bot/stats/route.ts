import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'
import { getBotInfo, getBotGuilds } from '@/lib/discord'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const config = await db.collection('config').findOne({ key: 'bot' })

  if (!config?.token) {
    return NextResponse.json({ connected: false })
  }

  try {
    const [bot, guilds] = await Promise.all([
      getBotInfo(config.token),
      getBotGuilds(config.token),
    ])

    const [commandCount, modCount, automodCount, activeGiveaways] = await Promise.all([
      db.collection('tracker').countDocuments({ type: 'command' }),
      db.collection('tracker').countDocuments({ type: 'mod_action' }),
      db.collection('tracker').countDocuments({ type: 'automod' }),
      db.collection('giveaways').countDocuments({ active: true }),
    ])

    const uptime = await db.collection('config').findOne({ key: 'uptime' })

    return NextResponse.json({
      connected: true,
      bot,
      guilds: guilds.length,
      commandCount,
      modCount,
      automodCount,
      activeGiveaways,
      uptimeSince: uptime?.since || null,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
