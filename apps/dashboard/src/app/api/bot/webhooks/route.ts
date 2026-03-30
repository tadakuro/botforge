import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

const DISCORD_API = 'https://discord.com/api/v10'

async function getToken(db) {
  const config = await db.collection('config').findOne({ key: 'bot' })
  return config?.token || null
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const token = await getToken(db)
  if (!token) return NextResponse.json({ error: 'Bot not connected' }, { status: 400 })

  // Get all guilds then fetch webhooks for each
  const guildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bot ${token}` },
  })
  if (!guildsRes.ok) return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 })
  const guilds = await guildsRes.json()

  const allWebhooks = []
  for (const guild of guilds.slice(0, 5)) {
    const res = await fetch(`${DISCORD_API}/guilds/${guild.id}/webhooks`, {
      headers: { Authorization: `Bot ${token}` },
    })
    if (res.ok) {
      const hooks = await res.json()
      allWebhooks.push(...hooks)
    }
  }

  return NextResponse.json(allWebhooks)
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channelId, name, avatarUrl } = await request.json()
  if (!channelId || !name) return NextResponse.json({ error: 'channelId and name required' }, { status: 400 })

  const db = await getDb()
  const token = await getToken(db)
  if (!token) return NextResponse.json({ error: 'Bot not connected' }, { status: 400 })

  const body = { name }
  if (avatarUrl) body.avatar = avatarUrl

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/webhooks`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message || 'Failed to create webhook' }, { status: 400 })
  }

  const webhook = await res.json()
  return NextResponse.json(webhook)
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { webhookId } = await request.json()
  if (!webhookId) return NextResponse.json({ error: 'webhookId required' }, { status: 400 })

  const db = await getDb()
  const token = await getToken(db)
  if (!token) return NextResponse.json({ error: 'Bot not connected' }, { status: 400 })

  const res = await fetch(`${DISCORD_API}/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${token}` },
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 400 })
  return NextResponse.json({ success: true })
}
