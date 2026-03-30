import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { Db } from 'mongodb'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  async execute(interaction: ChatInputCommandInteraction, _db: Db): Promise<void> {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })
    const latency = (sent as { createdTimestamp: number }).createdTimestamp - interaction.createdTimestamp
    await interaction.editReply(`🏓 Pong! Latency: **${latency}ms** | API: **${interaction.client.ws.ping}ms**`)
  },
}
