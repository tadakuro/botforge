import { Client } from 'discord.js'
import { Db } from 'mongodb'

export interface BotEvent {
  name: string
  once?: boolean
  execute(client: Client, db: Db, ...args: unknown[]): Promise<void>
}
