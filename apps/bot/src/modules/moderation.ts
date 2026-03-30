import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Guild, GuildMember, TextBasedChannel } from 'discord.js'
import { Db } from 'mongodb'
import { ObjectId } from 'mongodb'

const PERMS: Record<string, bigint> = {
  ban: PermissionFlagsBits.BanMembers,
  kick: PermissionFlagsBits.KickMembers,
  warn: PermissionFlagsBits.ModerateMembers,
  timeout: PermissionFlagsBits.ModerateMembers,
  purge: PermissionFlagsBits.ManageMessages,
  mute: PermissionFlagsBits.ModerateMembers,
  unmute: PermissionFlagsBits.ModerateMembers,
  unban: PermissionFlagsBits.BanMembers,
  softban: PermissionFlagsBits.BanMembers,
  infractions: PermissionFlagsBits.ModerateMembers,
  slowmode: PermissionFlagsBits.ManageChannels,
  lockdown: PermissionFlagsBits.ManageChannels,
}

interface ModerationConfig extends Record<string, unknown> {
  enabled?: boolean
  modLogChannel?: string
  dmOnAction?: boolean
  maxWarns?: number
  antiNuke?: {
    enabled: boolean
    kickThreshold: number
    banThreshold: number
    timeWindow: number
    lockdownDuration: number
    protectedRoles?: string[]
  }
}

interface NukeEvent {
  guildId: string
  userId: string
  action: 'kick' | 'ban' | 'channel_delete' | 'role_delete'
  timestamp: Date
  _id?: ObjectId
}

export async function handleModeration(interaction: ChatInputCommandInteraction, db: Db): Promise<void> {
  const config = (await db.collection('modules').findOne({ key: 'moderation' })) as ModerationConfig | null
  if (!config?.enabled) return

  const { commandName, options, guild, member } = interaction
  const guildMember = member as GuildMember

  if (!guildMember.permissions.has(PERMS[commandName])) {
    await interaction.reply({ content: '❌ You do not have permission.', ephemeral: true })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  try {
    if (commandName === 'ban') {
      const target = options.getUser('user', true)
      const reason = options.getString('reason') || 'No reason provided'
      await guild!.members.ban(target.id, { reason })
      await interaction.editReply(`✅ Banned **${target.username}** — ${reason}`)
      await sendModLog(db, config, interaction, 'BAN', target.username, reason, '#ef4444')
      await logAction(db, interaction, 'BAN', target.id, reason)

    } else if (commandName === 'kick') {
      const target = options.getMember('user')
      if (!target) { await interaction.editReply('❌ Member not found.'); return }
      const user = target.user
      const reason = options.getString('reason') || 'No reason provided'
      await target.kick(reason)
      await interaction.editReply(`✅ Kicked **${user.username}** — ${reason}`)
      await sendModLog(db, config, interaction, 'KICK', user.username, reason, '#f59e0b')
      await logAction(db, interaction, 'KICK', user.id, reason)

    } else if (commandName === 'warn') {
      const target = options.getUser('user', true)
      const reason = options.getString('reason') || 'No reason provided'
      await logAction(db, interaction, 'WARN', target.id, reason)
      if (config.dmOnAction) {
        try { await target.send(`⚠️ You have been warned in **${guild!.name}**: ${reason}`) } catch {}
      }
      const warnCount = await db.collection('tracker').countDocuments({
        type: 'mod_action', action: 'WARN', userId: target.id, guildId: guild!.id,
      })
      if (config.maxWarns && warnCount >= (config.maxWarns as number)) {
        await guild!.members.ban(target.id, { reason: `Auto-ban: ${config.maxWarns} warnings` })
        await interaction.editReply(`🔨 Auto-banned **${target.username}** after ${warnCount} warnings.`)
        await sendModLog(db, config, interaction, 'AUTO-BAN', target.username, `${warnCount} warnings`, '#ef4444')
      } else {
        await interaction.editReply(`⚠️ Warned **${target.username}** (${warnCount} total) — ${reason}`)
        await sendModLog(db, config, interaction, 'WARN', target.username, reason, '#f59e0b')
      }

    } else if (commandName === 'timeout') {
      const target = options.getMember('user')
      if (!target) { await interaction.editReply('❌ Member not found.'); return }
      const minutes = options.getInteger('minutes') || 10
      const reason = options.getString('reason') || 'No reason provided'
      const user = target.user
      await target.timeout(minutes * 60000, reason)
      await interaction.editReply(`⏱️ Timed out **${user.username}** for ${minutes}m — ${reason}`)
      await sendModLog(db, config, interaction, 'TIMEOUT', user.username, `${minutes}m`, '#f59e0b')
      await logAction(db, interaction, 'TIMEOUT', user.id, reason)

    } else if (commandName === 'mute') {
      const target = options.getMember('user')
      if (!target) { await interaction.editReply('❌ Member not found.'); return }
      const reason = options.getString('reason') || 'No reason provided'
      const user = target.user
      await target.timeout(28 * 24 * 60 * 60 * 1000, reason)
      await interaction.editReply(`🔇 Muted **${user.username}** — ${reason}`)
      await sendModLog(db, config, interaction, 'MUTE', user.username, reason, '#8b5cf6')
      await logAction(db, interaction, 'MUTE', user.id, reason)

    } else if (commandName === 'unmute') {
      const target = options.getMember('user')
      if (!target) { await interaction.editReply('❌ Member not found.'); return }
      const reason = options.getString('reason') || 'Manual unmute'
      const user = target.user
      await target.timeout(null, reason)
      await interaction.editReply(`🔊 Unmuted **${user.username}** — ${reason}`)
      await sendModLog(db, config, interaction, 'UNMUTE', user.username, reason, '#10b981')
      await logAction(db, interaction, 'UNMUTE', user.id, reason)

    } else if (commandName === 'softban') {
      const target = options.getUser('user', true)
      const reason = options.getString('reason') || 'No reason provided'
      const days = Math.min(options.getInteger('days') || 1, 7)
      await guild!.members.ban(target.id, { reason, deleteMessageSeconds: days * 24 * 60 * 60 })
      try { await guild!.bans.remove(target.id, reason) } catch {}
      await interaction.editReply(`🔨 Soft-banned **${target.username}** (messages deleted) — ${reason}`)
      await sendModLog(db, config, interaction, 'SOFTBAN', target.username, reason, '#f59e0b')
      await logAction(db, interaction, 'SOFTBAN', target.id, reason)

    } else if (commandName === 'unban') {
      const userId = options.getString('user_id', true)
      const reason = options.getString('reason') || 'Manual unban'
      try {
        await guild!.bans.remove(userId, reason)
        const user = await guild!.client.users.fetch(userId).catch(() => null)
        const username = user?.username || userId
        await interaction.editReply(`✅ Unbanned **${username}** — ${reason}`)
        await sendModLog(db, config, interaction, 'UNBAN', username, reason, '#10b981')
        await logAction(db, interaction, 'UNBAN', userId, reason)
      } catch (err) {
        await interaction.editReply(`❌ Could not unban user: ${(err as Error).message}`)
      }

    } else if (commandName === 'purge') {
      const amount = Math.min(options.getInteger('amount') || 10, 100)
      const deleted = await interaction.channel!.bulkDelete(amount, true)
      await interaction.editReply(`🗑️ Deleted ${deleted.size} messages.`)
      await logAction(db, interaction, 'PURGE', interaction.user.id, `Deleted ${deleted.size} messages`)

    } else if (commandName === 'slowmode') {
      const seconds = Math.min(options.getInteger('seconds') || 0, 21600)
      const reason = options.getString('reason') || 'No reason provided'
      const channel = interaction.channel as TextBasedChannel
      await channel.setRateLimitPerUser(seconds, reason)
      const status = seconds === 0 ? '✅ Disabled' : `⏱️ Set to ${seconds}s`
      await interaction.editReply(`${status} slowmode — ${reason}`)
      await logAction(db, interaction, 'SLOWMODE', interaction.user.id, `${seconds}s slowmode`)

    } else if (commandName === 'infractions') {
      const target = options.getUser('user', true)
      const actions = await db.collection('tracker').find({
        type: 'mod_action',
        userId: target.id,
        guildId: guild!.id,
      }).sort({ at: -1 }).limit(10).toArray()

      if (!actions || actions.length === 0) {
        await interaction.editReply(`ℹ️ No infractions found for **${target.username}**.`)
        return
      }

      const infracList = actions.map((a: Record<string, unknown>, i: number) => {
        const action = a.action as string
        const reason = a.reason as string
        const date = (a.at as Date).toLocaleDateString()
        return `${i + 1}. **${action}** — ${reason} *(${date})*`
      }).join('\n')

      const embed = new EmbedBuilder()
        .setTitle(`📋 Infractions for ${target.username}`)
        .setDescription(infracList || 'No infractions found')
        .setColor('#ef4444')
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

    } else if (commandName === 'lockdown') {
      const channel = options.getChannel('channel') || interaction.channel
      const reason = options.getString('reason') || 'Lockdown initiated'
      const duration = options.getInteger('duration_minutes') || 0

      const everyoneRole = guild!.roles.everyone
      const textChannel = channel as TextBasedChannel
      await textChannel.permissionOverwrites.edit(everyoneRole.id, {
        SendMessages: false,
        AddReactions: false,
      }, reason)

      const status = duration ? `for ${duration} minutes` : 'indefinitely'
      await interaction.editReply(`🔒 **${channel!.name}** locked ${status} — ${reason}`)
      await logAction(db, interaction, 'LOCKDOWN', interaction.user.id, `Locked ${channel!.name}`)

      if (duration && duration > 0) {
        setTimeout(async () => {
          await textChannel.permissionOverwrites.edit(everyoneRole.id, {
            SendMessages: null,
            AddReactions: null,
          }, 'Automatic unlock')
        }, duration * 60 * 1000)
      }
    }

  } catch (err: unknown) {
    try { await interaction.editReply(`❌ Failed: ${(err as Error).message}`) } catch {}
  }
}

export async function checkAntiNuke(db: Db, guild: Guild, action: 'kick' | 'ban' | 'channel_delete' | 'role_delete', userId: string): Promise<boolean> {
  const config = (await db.collection('modules').findOne({ key: 'moderation' })) as ModerationConfig | null
  if (!config?.enabled || !config.antiNuke?.enabled) return false

  const settings = config.antiNuke!
  const timeWindow = settings.timeWindow || 30
  const kickThreshold = settings.kickThreshold || 5
  const banThreshold = settings.banThreshold || 10

  if (settings.protectedRoles && settings.protectedRoles.length > 0) {
    const member = await guild.members.fetch(userId).catch(() => null)
    if (member?.roles.cache.some(r => settings.protectedRoles!.includes(r.id))) {
      return false
    }
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() - timeWindow * 1000)

  await db.collection('nuke_tracker').insertOne({
    guildId: guild.id,
    userId,
    action,
    timestamp: now,
  } as NukeEvent)

  const actionCount = await db.collection('nuke_tracker').countDocuments({
    guildId: guild.id,
    userId,
    timestamp: { $gte: windowStart },
  })

  await db.collection('nuke_tracker').deleteMany({
    timestamp: { $lt: new Date(now.getTime() - 5 * 60 * 1000) },
  })

  if (actionCount >= banThreshold) {
    try {
      await guild.members.ban(userId, {
        reason: `Anti-nuke: ${actionCount} actions in ${timeWindow}s`,
        deleteMessageSeconds: 0,
      })

      const modConfig = config
      if (modConfig.modLogChannel) {
        const channel = guild.channels.cache.get(modConfig.modLogChannel as string)
        if (channel && 'send' in channel) {
          const embed = new EmbedBuilder()
            .setTitle('🚨 ANTI-NUKE: User Banned')
            .setDescription(`**User:** <@${userId}>\n**Actions:** ${actionCount}\n**Time Window:** ${timeWindow}s`)
            .setColor('#dc2626')
            .setTimestamp()
          ;(channel as TextBasedChannel).send({ embeds: [embed] }).catch(() => {})
        }
      }

      return true
    } catch (err) {
      console.error('Failed to ban user in anti-nuke:', err)
    }
  } else if (actionCount >= kickThreshold) {
    try {
      const member = await guild.members.fetch(userId).catch(() => null)
      if (member) {
        await member.kick(`Anti-nuke: ${actionCount} actions in ${timeWindow}s`)
      }

      const modConfig = config
      if (modConfig.modLogChannel) {
        const channel = guild.channels.cache.get(modConfig.modLogChannel as string)
        if (channel && 'send' in channel) {
          const embed = new EmbedBuilder()
            .setTitle('⚠️ ANTI-NUKE: User Kicked')
            .setDescription(`**User:** <@${userId}>\n**Actions:** ${actionCount}\n**Time Window:** ${timeWindow}s`)
            .setColor('#f59e0b')
            .setTimestamp()
          ;(channel as TextBasedChannel).send({ embeds: [embed] }).catch(() => {})
        }
      }

      return true
    } catch (err) {
      console.error('Failed to kick user in anti-nuke:', err)
    }
  }

  return false
}

async function sendModLog(
  db: Db, config: Record<string, unknown>,
  interaction: ChatInputCommandInteraction,
  action: string, username: string, detail: string, color: string
) {
  if (!config.modLogChannel) return
  const ch = interaction.guild!.channels.cache.get(config.modLogChannel as string)
  if (!ch || !('send' in ch)) return
  ;(ch as TextBasedChannel).send({
    embeds: [new EmbedBuilder().setColor(color as `#${string}`).setTitle(`🔨 ${action}`)
      .setDescription(`**User:** ${username}\n**Detail:** ${detail}`).setTimestamp()],
  }).catch(() => {})
}

async function logAction(db: Db, interaction: ChatInputCommandInteraction, action: string, userId: string, reason: string) {
  await db.collection('tracker').insertOne({
    type: 'mod_action', action, userId, reason,
    guildId: interaction.guild!.id, at: new Date(),
  }).catch(() => {})
}
