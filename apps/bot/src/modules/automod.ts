import { Message, GuildMember } from 'discord.js'
import { Db } from 'mongodb'

const spamMap = new Map<string, number[]>()

export async function handleAutomod(message: Message, db: Db): Promise<void> {
  const config = await db.collection('modules').findOne({ key: 'automod' })
  if (!config?.enabled) return

  // Exempt channel
  if (config.exemptChannels && message.channelId === config.exemptChannels) return

  // Exempt roles
  if (config.exemptRoles) {
    const exemptIds = (config.exemptRoles as string).split(',').map((r: string) => r.trim()).filter(Boolean)
    const member = message.member as GuildMember
    if (member && exemptIds.some((id: string) => member.roles.cache.has(id))) return
  }

  const content = message.content
  const lower = content.toLowerCase()
  const userId = message.author.id

  if (config.filterSpam) {
    const now = Date.now()
    const history = spamMap.get(userId) || []
    const recent = history.filter(t => now - t < 5000)
    recent.push(now)
    spamMap.set(userId, recent)
    if (recent.length >= 5) { await handleViolation(message, db, config, 'Spam detected'); return }
  }

  if (config.filterLinks && /(https?:\/\/|www\.)\S+/.test(lower)) {
    await handleViolation(message, db, config, 'Link blocked'); return
  }

  if (config.filterInvites && /(discord\.gg|discord\.com\/invite)\/\S+/.test(lower)) {
    await handleViolation(message, db, config, 'Invite link blocked'); return
  }

  if (config.filterMentions && message.mentions.users.size >= 5) {
    await handleViolation(message, db, config, 'Mass mention blocked'); return
  }

  if (config.filterCaps && content.length >= 8) {
    const letters = content.replace(/[^a-zA-Z]/g, '')
    const upper = content.replace(/[^A-Z]/g, '')
    if (letters.length > 0 && upper.length / letters.length > 0.7) {
      await handleViolation(message, db, config, 'Excessive caps'); return
    }
  }

  if (config.filterEmoji) {
    const count = (content.match(/\p{Emoji}/gu) || []).length
    if (count > 8) { await handleViolation(message, db, config, 'Emoji spam'); return }
  }

  if (config.bannedWords) {
    const banned = (config.bannedWords as string).split(',').map((w: string) => w.trim().toLowerCase()).filter(Boolean)
    if (banned.some((w: string) => lower.includes(w))) {
      await handleViolation(message, db, config, 'Banned word detected'); return
    }
  }
}

async function handleViolation(message: Message, db: Db, config: Record<string, unknown>, reason: string) {
  try { await message.delete() } catch {}

  await db.collection('tracker').insertOne({
    type: 'automod', reason,
    userId: message.author.id,
    guildId: message.guild!.id,
    at: new Date(),
  }).catch(() => {})

  if (config.action === 'warn') {
    try { await message.author.send(`Your message was removed in **${message.guild!.name}**: ${reason}`) } catch {}
  } else if (config.action === 'timeout') {
    try {
      const member = await message.guild!.members.fetch(message.author.id)
      await member.timeout(5 * 60000, reason)
    } catch {}
  } else if (config.action === 'kick') {
    try {
      const member = await message.guild!.members.fetch(message.author.id)
      await member.kick(reason)
    } catch {}
  }
}
