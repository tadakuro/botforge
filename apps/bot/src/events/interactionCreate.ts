import { Interaction } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'
import { handleCustomCommand } from '../modules/customCommands'
import { trackInteraction } from '../modules/tracker'

const MOD_COMMANDS = ['ban', 'kick', 'warn', 'timeout', 'purge']

export default {
  name: 'interactionCreate',
  once: false,
  async execute(_client: unknown, db: Db, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return
    await trackInteraction(interaction, db)
    if (MOD_COMMANDS.includes(interaction.commandName)) {
      await handleModeration(interaction, db)
    } else {
      await handleCustomCommand(interaction, db)
    }
  },
}
