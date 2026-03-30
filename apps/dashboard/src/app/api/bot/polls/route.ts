import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const polls = await db.collection('polls').find({}).sort({ createdAt: -1 }).toArray()
  return NextResponse.json(polls.map(p => ({ ...p, _id: p._id.toString() })))
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.question || !body.channelId || !body.options?.length) {
    return NextResponse.json({ error: 'question, channelId and options are required' }, { status: 400 })
  }
  const db = await getDb()
  const result = await db.collection('polls').insertOne({
    ...body,
    active: true,
    votes: {},
    createdAt: new Date(),
  })
  return NextResponse.json({ success: true, id: result.insertedId.toString() })
}

export async function PUT(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, action } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { ObjectId } = await import('mongodb')
  let objectId
  try { objectId = new ObjectId(id) } catch {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const db = await getDb()
  if (action === 'end') {
    await db.collection('polls').updateOne(
      { _id: objectId },
      { $set: { active: false, endedAt: new Date() } }
    )
  }
  return NextResponse.json({ success: true })
}
