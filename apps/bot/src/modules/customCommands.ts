import { ChatInputCommandInteraction } from 'discord.js'
import { Db } from 'mongodb'

const MOD_COMMANDS = ['ban', 'kick', 'warn', 'timeout', 'purge']

export async function handleCustomCommand(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
  if (MOD_COMMANDS.includes(interaction.commandName)) return

  // Check DB before deferring to avoid hanging interactions
  const cmd = await db.collection('commands').findOne({ name: interaction.commandName }).catch(() => null)
  if (!cmd?.code) return

  try {
    await interaction.deferReply()
  } catch {
    return // Expired
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function('module', 'require', `${cmd.code as string}\nreturn module.exports`)
    const handler = fn({ exports: {} }, require) as unknown
    if (typeof handler === 'function') {
      await (handler as (i: ChatInputCommandInteraction) => Promise<void>)(interaction)
    } else {
      await interaction.editReply({ content: '❌ Command does not export a function.' })
      return
    }

    await db.collection('tracker').insertOne({
      type: 'command',
      command: `/${cmd.name as string}`,
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      at: new Date(),
    }).catch(() => {})

  } catch (err: unknown) {
    try { await interaction.editReply({ content: '❌ An error occurred running this command.' }) } catch {}
    console.error(`Command error /${interaction.commandName}:`, (err as Error).message)
  }
}
