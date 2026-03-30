import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { Db } from 'mongodb'

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  execute(interaction: ChatInputCommandInteraction, db: Db): Promise<void>
}
