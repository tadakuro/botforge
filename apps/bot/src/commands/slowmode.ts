import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode (rate limiting)')
    .addIntegerOption(option =>
      option
        .setName('seconds')
        .setDescription('Slowmode duration in seconds (0 = disable)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for slowmode')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
    await handleModeration(interaction, db)
  },
}
