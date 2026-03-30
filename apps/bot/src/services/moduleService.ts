import { Db } from 'mongodb'

export async function getModuleConfig(db: Db, key: string): Promise<Record<string, unknown> | null> {
  return db.collection('modules').findOne({ key }) as Promise<Record<string, unknown> | null>
}

export async function isModuleEnabled(db: Db, key: string): Promise<boolean> {
  const config = await getModuleConfig(db, key)
  return config?.enabled === true
}
