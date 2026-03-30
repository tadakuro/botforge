import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = await getDb()
    const config = await db.collection('config').findOne({ key: 'bot' })
    if (!config?.token) return NextResponse.json({ status: 'NO_TOKEN', online: false })

    const res = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${config.token}` },
    })
    return NextResponse.json({ status: res.ok ? 'ONLINE' : 'OFFLINE', online: res.ok })
  } catch {
    return NextResponse.json({ status: 'OFFLINE', online: false })
  }
}

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(
    { error: 'Bot control is not available via API. Manage your bot directly on Railway.' },
    { status: 503 }
  )
}
