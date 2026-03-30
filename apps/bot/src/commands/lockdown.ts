import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'

export default {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock a channel from @everyone')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel to lock (current channel if not specified)')
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for lockdown')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('duration_minutes')
        .setDescription('Minutes until auto-unlock (0 = manual unlock)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(525600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
    await handleModeration(interaction, db)
  },
}
