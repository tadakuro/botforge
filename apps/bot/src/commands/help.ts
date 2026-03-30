import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { Db } from 'mongodb'

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),
  async execute(interaction: ChatInputCommandInteraction, _db: Db): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('📋 BotForge Commands')
      .setDescription('Here are all available commands:')
      .addFields(
        { name: '🛡️ Moderation', value: '`/ban` `/kick` `/warn` `/timeout` `/purge`', inline: false },
        { name: '🔧 Utility', value: '`/ping` `/help`', inline: false },
        { name: '💡 Custom', value: 'Custom commands created in the dashboard', inline: false },
      )
      .setFooter({ text: 'Manage settings at your BotForge dashboard' })
      .setTimestamp()
    await interaction.reply({ embeds: [embed], ephemeral: true })
  },
}
