import { Client, EmbedBuilder, MessageReaction, User } from 'discord.js'
import { Db } from 'mongodb'

const EMOJIS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
const getEmoji = (i: number) => EMOJIS[i] || String(i + 1)

function findChannel(client: Client, channelId: string) {
  for (const guild of client.guilds.cache.values()) {
    const ch = guild.channels.cache.get(channelId)
    if (ch && 'send' in ch) return ch as { send(opts: unknown): Promise<{ react(e: string): Promise<void> }> }
  }
  return null
}

export function initPolls(client: Client, db: Db): void {
  // Send unsent polls every 5s
  setInterval(async () => {
    const unsent = await db.collection('polls').find({ active: true, messageId: { $exists: false } }).toArray()
    for (const poll of unsent) {
      try {
        const channel = findChannel(client, poll.channelId as string)
        if (!channel) {
          await db.collection('polls').updateOne({ _id: poll._id }, { $set: { messageId: 'failed', active: false } })
          continue
        }
        const endsAt = new Date(poll.endsAt as Date)
        const embed = new EmbedBuilder().setColor('#5865f2').setTitle(`📊 ${poll.question as string}`)
          .setDescription((poll.options as string[]).map((opt, i) => `${getEmoji(i)} **${opt}**`).join('\n\n'))
          .setFooter({ text: `${poll.multiVote ? 'Multiple choice' : 'Single choice'} · Ends ${endsAt.toLocaleString()}` })
          .setTimestamp(endsAt)
        const msg = await channel.send({ embeds: [embed] })
        for (let i = 0; i < (poll.options as string[]).length; i++) {
          await msg.react(getEmoji(i)).catch(() => {})
        }
        await db.collection('polls').updateOne({ _id: poll._id }, { $set: { messageId: (msg as unknown as { id: string }).id } })
      } catch (err: unknown) {
        console.error('Poll send error:', (err as Error).message)
        await db.collection('polls').updateOne({ _id: poll._id }, { $set: { messageId: 'failed' } }).catch(() => {})
      }
    }
  }, 5000)

  // Track votes
  client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
    if (user.bot) return
    if (reaction.partial) { try { await reaction.fetch() } catch { return } }
    const poll = await db.collection('polls').findOne({ messageId: reaction.message.id, active: true })
    if (!poll) return
    const emoji = reaction.emoji.name
    const optionIndex = (poll.options as string[]).findIndex((_: string, i: number) => getEmoji(i) === emoji)
    if (optionIndex === -1) return
    if (!poll.multiVote) {
      const others = reaction.message.reactions.cache.filter(r => r.emoji.name !== emoji)
      for (const [, r] of others) await r.users.remove(user.id).catch(() => {})
    }
    await db.collection('polls').updateOne({ _id: poll._id }, { $set: { [`votes.${user.id}`]: optionIndex } }).catch(() => {})
  })

  // End expired polls every 30s
  setInterval(async () => {
    const now = new Date()
    const ended = await db.collection('polls').find({ active: true, messageId: { $exists: true, $ne: 'failed' }, endsAt: { $lte: now } }).toArray()
    for (const poll of ended) {
      await db.collection('polls').updateOne({ _id: poll._id }, { $set: { active: false, endedAt: now } })
      const channel = findChannel(client, poll.channelId as string)
      if (!channel) continue
      const votes = (poll.votes || {}) as Record<string, number>
      const counts = (poll.options as string[]).map((_: string, i: number) => Object.values(votes).filter(v => v === i).length)
      const total = counts.reduce((a, b) => a + b, 0)
      const maxVotes = Math.max(...counts, 0)
      const winnerIdx = counts.indexOf(maxVotes)
      const embed = new EmbedBuilder().setColor('#5865f2').setTitle(`📊 Poll Ended: ${poll.question as string}`)
        .setDescription((poll.options as string[]).map((opt: string, i: number) => {
          const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0
          const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
          return `${getEmoji(i)} **${opt}**${i === winnerIdx && total > 0 ? ' 🏆' : ''}\n${bar} ${pct}% (${counts[i]} votes)`
        }).join('\n\n'))
        .setFooter({ text: `${total} total vote${total !== 1 ? 's' : ''}` }).setTimestamp()
      await channel.send({ embeds: [embed] })
    }
  }, 30000)
}
