import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user for 28 days')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to mute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for muting')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
    await handleModeration(interaction, db)
  },
}
