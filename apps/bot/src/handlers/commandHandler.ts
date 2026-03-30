import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js'
import { Db } from 'mongodb'
import { BUILTIN_COMMANDS } from '@botforge/config'
import { logger } from '../utils/logger'

export async function registerCommands(client: Client, db: Db): Promise<number> {
  const token = client.token!
  const clientId = client.user!.id
  const rest = new REST({ version: '10' }).setToken(token)

  // Load custom commands from DB
  const savedCommands = await db.collection('commands').find({}).toArray()
  const dynamicCommands = savedCommands
    .filter(cmd => cmd.name && /^[\w-]{1,32}$/.test(cmd.name.toLowerCase()))
    .map(cmd => ({ name: cmd.name.toLowerCase(), description: cmd.description || `Custom: ${cmd.name}` }))

  const allCommands = [...BUILTIN_COMMANDS, ...dynamicCommands]

  await rest.put(Routes.applicationCommands(clientId), { body: allCommands })
  logger.success(`Registered ${allCommands.length} slash commands`)
  return allCommands.length
}
