import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const messages = await db.collection('scheduled_messages').find({}).sort({ scheduledAt: 1 }).toArray()
  return NextResponse.json(messages.map(m => ({ ...m, _id: m._id.toString() })))
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.message || !body.channelId || !body.scheduledAt) {
    return NextResponse.json({ error: 'message, channelId and scheduledAt are required' }, { status: 400 })
  }
  const db = await getDb()
  const result = await db.collection('scheduled_messages').insertOne({
    ...body,
    scheduledAt: new Date(body.scheduledAt),
    sent: false,
    createdAt: new Date(),
  })
  return NextResponse.json({ success: true, id: result.insertedId.toString() })
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { ObjectId } = await import('mongodb')
  let objectId
  try { objectId = new ObjectId(id) } catch {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('scheduled_messages').deleteOne({ _id: objectId })
  return NextResponse.json({ success: true })
}
