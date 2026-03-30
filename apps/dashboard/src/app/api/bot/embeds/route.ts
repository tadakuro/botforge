import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const config = await db.collection('modules').findOne({ key: 'embeds' })
  return NextResponse.json(config || { key: 'embeds', enabled: false })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (body.action === 'send') {
    const { embed } = body
    if (!embed?.channelId) return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
    if (!embed?.title && !embed?.description) {
      return NextResponse.json({ error: 'Embed must have a title or description' }, { status: 400 })
    }

    const db = await getDb()
    const config = await db.collection('config').findOne({ key: 'bot' })
    if (!config?.token) return NextResponse.json({ error: 'Bot not connected' }, { status: 400 })

    const discordEmbed = {}
    if (embed.title) discordEmbed.title = embed.title
    if (embed.description) discordEmbed.description = embed.description
    if (embed.color) {
      const colorInt = parseInt(embed.color.replace('#', ''), 16)
      if (!isNaN(colorInt)) discordEmbed.color = colorInt
    }
    if (embed.footer) discordEmbed.footer = { text: embed.footer }
    if (embed.image) discordEmbed.image = { url: embed.image }
    if (embed.thumbnail) discordEmbed.thumbnail = { url: embed.thumbnail }
    if (embed.authorName) {
      discordEmbed.author = { name: embed.authorName }
      if (embed.authorIcon) discordEmbed.author.icon_url = embed.authorIcon
    }
    if (embed.fields?.length) {
      discordEmbed.fields = embed.fields.filter(f => f.name && f.value)
    }

    const res = await fetch(`https://discord.com/api/v10/channels/${embed.channelId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [discordEmbed] }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Failed to send embed' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  }

  const { _id, ...cleanBody } = body
  const db = await getDb()
  await db.collection('modules').updateOne(
    { key: 'embeds' },
    { $set: { ...cleanBody, key: 'embeds', updatedAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ success: true })
}
