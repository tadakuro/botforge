import { Interaction } from 'discord.js'
import { Db } from 'mongodb'

const MOD_COMMANDS = new Set(['ban', 'kick', 'warn', 'timeout', 'purge'])
const customCommandCache = new Set<string>()

export async function refreshCommandCache(db: Db): Promise<void> {
  const cmds = await db.collection('commands').find({}, { projection: { name: 1 } }).toArray()
  customCommandCache.clear()
  cmds.forEach(c => { if (c.name) customCommandCache.add((c.name as string).toLowerCase()) })
}

export async function trackInteraction(interaction: Interaction, db: Db): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  if (MOD_COMMANDS.has(interaction.commandName)) return
  if (customCommandCache.has(interaction.commandName)) return
  await db.collection('tracker').insertOne({
    type: 'command',
    command: `/${interaction.commandName}`,
    userId: interaction.user.id,
    guildId: interaction.guild?.id,
    at: new Date(),
  }).catch(() => {})
}
