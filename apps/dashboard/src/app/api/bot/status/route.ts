import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const status = await db.collection('config').findOne({ key: 'botstatus' })
  return NextResponse.json(status || { presence: 'online', activityType: 'PLAYING', activityText: '', streamUrl: '' })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { _id, ...clean } = body
  const db = await getDb()
  await db.collection('config').updateOne(
    { key: 'botstatus' },
    { $set: { ...clean, key: 'botstatus', updatedAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ success: true })
}
