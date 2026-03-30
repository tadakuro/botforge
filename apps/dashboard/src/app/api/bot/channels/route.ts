import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const config = await db.collection('config').findOne({ key: 'bot' })
  if (!config?.token) return NextResponse.json({ error: 'Bot not connected' }, { status: 400 })

  // Get all guilds
  const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: { Authorization: `Bot ${config.token}` },
  })
  if (!guildsRes.ok) return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 })
  const guilds = await guildsRes.json()

  // Fetch channels for first guild (primary server)
  if (!guilds.length) return NextResponse.json([])

  const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guilds[0].id}/channels`, {
    headers: { Authorization: `Bot ${config.token}` },
  })
  if (!channelsRes.ok) return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })

  const channels = await channelsRes.json()

  // Filter to text channels only (type 0) and sort by position
  const textChannels = channels
    .filter(c => c.type === 0)
    .sort((a, b) => a.position - b.position)
    .map(c => ({ id: c.id, name: c.name, parentId: c.parent_id }))

  // Also get categories for grouping
  const categories = channels
    .filter(c => c.type === 4)
    .sort((a, b) => a.position - b.position)
    .map(c => ({ id: c.id, name: c.name }))

  return NextResponse.json({ channels: textChannels, categories })
}
