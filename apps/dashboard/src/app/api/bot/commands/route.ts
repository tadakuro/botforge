import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const commands = await db.collection('commands').find({}).toArray()
  // Serialize _id to string so it's safe to send as JSON
  const serialized = commands.map(c => ({ ...c, _id: c._id.toString() }))
  return NextResponse.json(serialized)
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  const db = await getDb()
  const result = await db.collection('commands').insertOne({
    ...body,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return NextResponse.json({ success: true, id: result.insertedId.toString() })
}

export async function PUT(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...body } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { ObjectId } = await import('mongodb')
  let objectId
  try { objectId = new ObjectId(id) } catch {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('commands').updateOne(
    { _id: objectId },
    { $set: { ...body, updatedAt: new Date() } }
  )
  return NextResponse.json({ success: true })
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
  await db.collection('commands').deleteOne({ _id: objectId })
  return NextResponse.json({ success: true })
}
