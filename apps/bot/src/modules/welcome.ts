import { GuildMember, EmbedBuilder } from 'discord.js'
import { Db } from 'mongodb'

function getAccountAge(createdAt: Date): string {
  const days = Math.floor((Date.now() - createdAt.getTime()) / 86400000)
  if (days < 30) return `${days} days`
  if (days < 365) return `${Math.floor(days / 30)} months`
  return `${Math.floor(days / 365)} years`
}

export async function handleWelcome(member: GuildMember, db: Db): Promise<void> {
  const config = await db.collection('modules').findOne({ key: 'welcome' })
  if (!config?.enabled || !config.welcomeChannel) return

  const channel = member.guild.channels.cache.get(config.welcomeChannel as string)
  if (!channel || !('send' in channel)) return

  const ch = channel as { send(opts: unknown): Promise<void> }
  const memberCount = member.guild.memberCount
  const username = member.user.username
  const server = member.guild.name
  const accountAge = getAccountAge(member.user.createdAt)
  const joinDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const avatarUrl = member.user.displayAvatarURL({ size: 256, extension: 'png' })

  const replace = (str: string) => str
    .replace(/{username}/g, username)
    .replace(/{server}/g, server)
    .replace(/{memberCount}/g, String(memberCount))
    .replace(/{accountAge}/g, accountAge)
    .replace(/{joinDate}/g, joinDate)

  const embed = (config.welcomeEmbed || {}) as Record<string, unknown>

  if (!embed.title && !embed.description) {
    await ch.send(`Welcome ${member.toString()} to **${server}**! You are member #${memberCount}.`)
    return
  }

  const e = new EmbedBuilder().setColor((embed.color as `#${string}`) || '#5865f2').setTimestamp()
  if (embed.title) e.setTitle(replace(embed.title as string))
  if (embed.description) e.setDescription(replace(embed.description as string))
  if (embed.authorName) e.setAuthor({ name: replace(embed.authorName as string), iconURL: avatarUrl })
  if (embed.footer) e.setFooter({ text: replace(embed.footer as string) })
  if (embed.bannerUrl) e.setImage(embed.bannerUrl as string)
  if (embed.showAvatar) e.setThumbnail(avatarUrl)

  const fields: { name: string; value: string; inline: boolean }[] = []
  if (embed.showMemberCount) fields.push({ name: 'Member Count', value: `#${memberCount}`, inline: true })
  if (embed.showAccountAge) fields.push({ name: 'Account Age', value: accountAge, inline: true })
  if (embed.showJoinDate) fields.push({ name: 'Joined', value: joinDate, inline: true })
  if (fields.length) e.addFields(fields)

  await ch.send({ content: member.toString(), embeds: [e] })

  if (config.welcomeDM) {
    try { await member.send({ embeds: [e] }) } catch {}
  }
}

export async function handleGoodbye(member: GuildMember, db: Db): Promise<void> {
  const config = await db.collection('modules').findOne({ key: 'welcome' })
  if (!config?.enabled || !config.goodbyeChannel || !config.goodbyeMessage) return

  const channel = member.guild.channels.cache.get(config.goodbyeChannel as string)
  if (!channel || !('send' in channel)) return

  const msg = (config.goodbyeMessage as string)
    .replace(/{username}/g, member.user.username)
    .replace(/{server}/g, member.guild.name)

  await (channel as { send(m: string): Promise<void> }).send(msg)
}
