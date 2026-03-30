import { NextResponse } from 'next/server'
import { createSession, deleteSession } from '@/lib/session'

export async function POST(request) {
  const { password } = await request.json()

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  if (password !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  await deleteSession()
  return NextResponse.json({ success: true })
}
