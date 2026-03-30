import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

// Next.js dev mode hot-reload fix
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

export async function connectDb(): Promise<Db> {
  if (db) return db
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not set')

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri)
      await global._mongoClient.connect()
    }
    client = global._mongoClient
  } else {
    client = new MongoClient(uri)
    await client.connect()
  }

  db = client.db('botforge')
  return db
}

export async function getDb(): Promise<Db> {
  if (!db) await connectDb()
  return db!
}
