import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'

export default {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Softban a user (ban + unban, removes recent messages)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to softban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for softbanning')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('days')
        .setDescription('Days of messages to delete (1-7)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
    await handleModeration(interaction, db)
  },
}
