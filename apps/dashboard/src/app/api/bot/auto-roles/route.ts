import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const config = await db.collection('modules').findOne({ key: 'auto-roles' })
  return NextResponse.json(config || { key: 'auto-roles', enabled: false })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { _id, ...cleanBody } = body
  const db = await getDb()
  await db.collection('modules').updateOne(
    { key: 'auto-roles' },
    { $set: { ...cleanBody, key: 'auto-roles', updatedAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ success: true })
}
