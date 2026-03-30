import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const giveaways = await db.collection('giveaways').find({}).sort({ createdAt: -1 }).toArray()
  return NextResponse.json(giveaways.map(g => ({ ...g, _id: g._id.toString() })))
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.prize || !body.channelId) {
    return NextResponse.json({ error: 'prize and channelId are required' }, { status: 400 })
  }
  const db = await getDb()
  const result = await db.collection('giveaways').insertOne({
    ...body,
    active: true,
    entries: [],
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
  const giveaway = await db.collection('giveaways').findOne({ _id: objectId })
  if (!giveaway) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'end') {
    await db.collection('giveaways').updateOne(
      { _id: objectId },
      { $set: { active: false, endedAt: new Date() } }
    )
  } else if (action === 'reroll') {
    const entries = giveaway.entries || []
    if (!entries.length) return NextResponse.json({ error: 'No entries to reroll' }, { status: 400 })
    const winner = entries[Math.floor(Math.random() * entries.length)]
    await db.collection('giveaways').updateOne(
      { _id: objectId },
      { $set: { winner, rerolledAt: new Date() } }
    )
    return NextResponse.json({ success: true, winner })
  }
  return NextResponse.json({ success: true })
}
