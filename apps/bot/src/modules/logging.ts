import { EmbedBuilder, Message, GuildMember, GuildBan, VoiceState, Role, GuildChannel } from 'discord.js'
import { Db } from 'mongodb'

let configCache: Record<string, unknown> | null = null
let cacheExpiry = 0

async function getConfig(db: Db): Promise<Record<string, unknown> | null> {
  if (configCache && Date.now() < cacheExpiry) return configCache
  configCache = await db.collection('modules').findOne({ key: 'logging' }) as Record<string, unknown> | null
  cacheExpiry = Date.now() + 10000
  return configCache
}

export function invalidateLoggingCache(): void {
  configCache = null
  cacheExpiry = 0
}

function getChannelId(config: Record<string, unknown>, category: string): string | null {
  return (config[`${category}LogChannel`] as string) || (config.logChannel as string) || null
}

function send(guild: { channels: { cache: Map<string, unknown> } }, channelId: string | null, embed: EmbedBuilder): void {
  if (!channelId) return
  const ch = guild.channels.cache.get(channelId)
  if (ch && 'send' in (ch as object)) {
    (ch as { send(opts: unknown): Promise<void> }).send({ embeds: [embed] }).catch(() => {})
  }
}

export async function onMessageDelete(message: Message, db: Db): Promise<void> {
  if (message.author?.bot || !message.guild) return
  const config = await getConfig(db)
  if (!config?.enabled || !config.messageDelete) return
  send(message.guild as never, getChannelId(config, 'messages'),
    new EmbedBuilder().setColor('#ef4444').setTitle('🗑️ Message Deleted')
      .setDescription(`**Author:** ${message.author?.username} (<@${message.author?.id}>)\n**Channel:** <#${message.channelId}>\n**Content:** ${message.content || '*(empty)*'}`)
      .setTimestamp())
}

export async function onMessageUpdate(oldMsg: Message, newMsg: Message, db: Db): Promise<void> {
  if (oldMsg.author?.bot || oldMsg.content === newMsg.content || !newMsg.guild) return
  const config = await getConfig(db)
  if (!config?.enabled || !config.messageEdit) return
  send(newMsg.guild as never, getChannelId(config, 'messages'),
    new EmbedBuilder().setColor('#f59e0b').setTitle('✏️ Message Edited')
      .setDescription(`**Author:** ${oldMsg.author?.username}\n**Channel:** <#${oldMsg.channelId}>\n**Before:** ${oldMsg.content || '*(uncached)*'}\n**After:** ${newMsg.content}`)
      .setTimestamp())
}

export async function onMemberJoin(member: GuildMember, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.memberJoin) return
  send(member.guild as never, getChannelId(config, 'members'),
    new EmbedBuilder().setColor('#10b981').setTitle('✅ Member Joined')
      .setDescription(`**User:** ${member.user.username} (<@${member.id}>)\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
      .setThumbnail(member.user.displayAvatarURL()).setTimestamp())
}

export async function onMemberLeave(member: GuildMember, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.memberLeave) return
  send(member.guild as never, getChannelId(config, 'members'),
    new EmbedBuilder().setColor('#ef4444').setTitle('👋 Member Left')
      .setDescription(`**User:** ${member.user.username} (<@${member.id}>)`)
      .setThumbnail(member.user.displayAvatarURL()).setTimestamp())
}

export async function onMemberUpdate(oldMember: GuildMember, newMember: GuildMember, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled) return
  const chId = getChannelId(config, 'members')
  if (config.memberNickChange && oldMember.nickname !== newMember.nickname) {
    send(newMember.guild as never, chId,
      new EmbedBuilder().setColor('#f59e0b').setTitle('📝 Nickname Changed')
        .setDescription(`**User:** ${newMember.user.username}\n**Before:** ${oldMember.nickname || '*none*'}\n**After:** ${newMember.nickname || '*none*'}`)
        .setTimestamp())
  }
  if (config.memberRoleChange) {
    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id))
    const removed = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id))
    if (added.size || removed.size) {
      const desc = []
      if (added.size) desc.push(`**Added:** ${added.map((r: Role) => r.name).join(', ')}`)
      if (removed.size) desc.push(`**Removed:** ${removed.map((r: Role) => r.name).join(', ')}`)
      send(newMember.guild as never, chId,
        new EmbedBuilder().setColor('#5865f2').setTitle('🏷️ Roles Updated')
          .setDescription(`**User:** ${newMember.user.username}\n${desc.join('\n')}`).setTimestamp())
    }
  }
}

export async function onBanAdd(ban: GuildBan, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.memberBan) return
  send(ban.guild as never, getChannelId(config, 'members'),
    new EmbedBuilder().setColor('#ef4444').setTitle('🔨 Member Banned')
      .setDescription(`**User:** ${ban.user.username}\n**Reason:** ${ban.reason || 'No reason'}`).setTimestamp())
}

export async function onBanRemove(ban: GuildBan, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.memberUnban) return
  send(ban.guild as never, getChannelId(config, 'members'),
    new EmbedBuilder().setColor('#10b981').setTitle('✅ Member Unbanned')
      .setDescription(`**User:** ${ban.user.username}`).setTimestamp())
}

export async function onVoiceUpdate(oldState: VoiceState, newState: VoiceState, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled) return
  const guild = newState.guild || oldState.guild
  const chId = getChannelId(config, 'voice')
  if (!oldState.channelId && newState.channelId && config.voiceJoin) {
    send(guild as never, chId, new EmbedBuilder().setColor('#5865f2').setTitle('🎙️ Voice Join')
      .setDescription(`**User:** ${newState.member?.user.username} joined <#${newState.channelId}>`).setTimestamp())
  } else if (oldState.channelId && !newState.channelId && config.voiceLeave) {
    send(guild as never, chId, new EmbedBuilder().setColor('#6b6b80').setTitle('🎙️ Voice Leave')
      .setDescription(`**User:** ${oldState.member?.user.username} left <#${oldState.channelId}>`).setTimestamp())
  } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId && config.voiceMove) {
    send(guild as never, chId, new EmbedBuilder().setColor('#5865f2').setTitle('🎙️ Voice Move')
      .setDescription(`**User:** ${newState.member?.user.username}\n<#${oldState.channelId}> → <#${newState.channelId}>`).setTimestamp())
  }
}

export async function onRoleCreate(role: Role, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.roleCreate) return
  send(role.guild as never, getChannelId(config, 'server'),
    new EmbedBuilder().setColor('#10b981').setTitle('🏷️ Role Created').setDescription(`**Role:** ${role.name}`).setTimestamp())
}

export async function onRoleDelete(role: Role, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.roleDelete) return
  send(role.guild as never, getChannelId(config, 'server'),
    new EmbedBuilder().setColor('#ef4444').setTitle('🏷️ Role Deleted').setDescription(`**Role:** ${role.name}`).setTimestamp())
}

export async function onChannelCreate(channel: GuildChannel, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.channelCreate) return
  send(channel.guild as never, getChannelId(config, 'server'),
    new EmbedBuilder().setColor('#10b981').setTitle('📁 Channel Created')
      .setDescription(`**Channel:** <#${channel.id}> (${channel.name})`).setTimestamp())
}

export async function onChannelDelete(channel: GuildChannel, db: Db): Promise<void> {
  const config = await getConfig(db)
  if (!config?.enabled || !config.channelDelete) return
  send(channel.guild as never, getChannelId(config, 'server'),
    new EmbedBuilder().setColor('#ef4444').setTitle('📁 Channel Deleted')
      .setDescription(`**Channel:** #${channel.name}`).setTimestamp())
}
