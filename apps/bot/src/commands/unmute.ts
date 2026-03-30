import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Db } from 'mongodb'
import { handleModeration } from '../modules/moderation'

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove mute from a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to unmute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for unmuting')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
    await handleModeration(interaction, db)
  },
}
