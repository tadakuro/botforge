import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete bulk messages from the current channel')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
    await handleModeration(interaction, db)
  },
}
