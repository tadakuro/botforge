import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'
import { getBotInfo } from '@/lib/discord'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const config = await db.collection('config').findOne({ key: 'bot' })
  if (!config) return NextResponse.json({ connected: false })

  try {
    const bot = await getBotInfo(config.token)
    return NextResponse.json({ connected: true, bot })
  } catch {
    return NextResponse.json({ connected: false })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  try {
    const bot = await getBotInfo(token)
    const db = await getDb()
    await db.collection('config').updateOne(
      { key: 'bot' },
      { $set: { key: 'bot', token, botId: bot.id, updatedAt: new Date() } },
      { upsert: true }
    )
    return NextResponse.json({ success: true, bot })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  await db.collection('config').deleteOne({ key: 'bot' })
  return NextResponse.json({ success: true })
}
