import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

const DISCORD_API = 'https://discord.com/api/v10'

const BUILTIN_COMMANDS = [
  { name: 'ban', description: 'Ban a member', options: [
    { type: 6, name: 'user', description: 'User to ban', required: true },
    { type: 3, name: 'reason', description: 'Reason' },
  ]},
  { name: 'kick', description: 'Kick a member', options: [
    { type: 6, name: 'user', description: 'User to kick', required: true },
    { type: 3, name: 'reason', description: 'Reason' },
  ]},
  { name: 'warn', description: 'Warn a member', options: [
    { type: 6, name: 'user', description: 'User to warn', required: true },
    { type: 3, name: 'reason', description: 'Reason' },
  ]},
  { name: 'timeout', description: 'Timeout a member', options: [
    { type: 6, name: 'user', description: 'User to timeout', required: true },
    { type: 4, name: 'minutes', description: 'Duration in minutes' },
    { type: 3, name: 'reason', description: 'Reason' },
  ]},
  { name: 'purge', description: 'Bulk delete messages', options: [
    { type: 4, name: 'amount', description: 'Number of messages to delete', required: true },
  ]},
]

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const config = await db.collection('config').findOne({ key: 'bot' })
  if (!config?.token) return NextResponse.json({ error: 'Bot not connected' }, { status: 400 })

  // Fetch bot application ID
  const meRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bot ${config.token}` },
  })
  if (!meRes.ok) return NextResponse.json({ error: 'Invalid bot token' }, { status: 400 })
  const me = await meRes.json()

  // Load custom commands from MongoDB
  const savedCommands = await db.collection('commands').find({}).toArray()
  const dynamicCommands = savedCommands
    .filter(cmd => cmd.name && /^[\w-]{1,32}$/.test(cmd.name.toLowerCase()))
    .map(cmd => ({
      name: cmd.name.toLowerCase(),
      description: cmd.description || `Custom command: ${cmd.name}`,
    }))

  const allCommands = [...BUILTIN_COMMANDS, ...dynamicCommands]

  // Register via Discord REST API directly
  const res = await fetch(`${DISCORD_API}/applications/${me.id}/commands`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(allCommands),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message || 'Failed to register commands' }, { status: 400 })
  }

  const registered = await res.json()
  return NextResponse.json({ success: true, count: registered.length })
}
