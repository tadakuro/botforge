import { Client, EmbedBuilder, MessageReaction, User } from 'discord.js'
import { Db } from 'mongodb'

function findChannel(client: Client, channelId: string) {
  for (const guild of client.guilds.cache.values()) {
    const ch = guild.channels.cache.get(channelId)
    if (ch && 'send' in ch) return ch as { send(opts: unknown): Promise<{ react(e: string): Promise<void> }> }
  }
  return null
}

export function initGiveaways(client: Client, db: Db): void {
  // Send unsent giveaways every 5s
  setInterval(async () => {
    const unsent = await db.collection('giveaways').find({ active: true, messageId: { $exists: false } }).toArray()
    for (const giveaway of unsent) {
      try {
        const channel = findChannel(client, giveaway.channelId as string)
        if (!channel) {
          await db.collection('giveaways').updateOne({ _id: giveaway._id }, { $set: { messageId: 'failed', active: false } })
          continue
        }
        const endsAt = new Date(giveaway.endsAt as Date)
        const embed = new EmbedBuilder().setColor('#5865f2').setTitle('🎉 Giveaway!')
          .setDescription(`**Prize:** ${giveaway.prize as string}\n\nReact with 🎉 to enter!\n\n**Winners:** ${giveaway.winners || 1}\n**Ends:** ${endsAt.toLocaleString()}`)
          .setFooter({ text: giveaway.requiredRole ? `Required role: ${giveaway.requiredRole as string}` : 'Anyone can enter' })
          .setTimestamp(endsAt)
        const msg = await channel.send({ embeds: [embed] })
        await msg.react('🎉')
        await db.collection('giveaways').updateOne({ _id: giveaway._id }, { $set: { messageId: (msg as unknown as { id: string }).id } })
      } catch (err: unknown) {
        console.error('Giveaway send error:', (err as Error).message)
        await db.collection('giveaways').updateOne({ _id: giveaway._id }, { $set: { messageId: 'failed' } }).catch(() => {})
      }
    }
  }, 5000)

  // Track entries
  client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
    if (user.bot) return
    if (reaction.partial) { try { await reaction.fetch() } catch { return } }
    if (reaction.emoji.name !== '🎉') return
    const giveaway = await db.collection('giveaways').findOne({ messageId: reaction.message.id, active: true })
    if (!giveaway) return
    if (giveaway.requiredRole) {
      try {
        const member = await reaction.message.guild!.members.fetch(user.id)
        if (!member.roles.cache.has(giveaway.requiredRole as string)) {
          await reaction.users.remove(user.id).catch(() => {})
          return
        }
      } catch {}
    }
    await db.collection('giveaways').updateOne({ _id: giveaway._id }, { $addToSet: { entries: user.id } }).catch(() => {})
  })

  // End expired giveaways every 30s
  setInterval(async () => {
    const now = new Date()
    const ended = await db.collection('giveaways').find({ active: true, messageId: { $exists: true, $ne: 'failed' }, endsAt: { $lte: now } }).toArray()
    for (const giveaway of ended) {
      await db.collection('giveaways').updateOne({ _id: giveaway._id }, { $set: { active: false, endedAt: now } })
      const channel = findChannel(client, giveaway.channelId as string)
      if (!channel) continue
      const entries = (giveaway.entries || []) as string[]
      if (!entries.length) { await channel.send(`🎉 Giveaway for **${giveaway.prize as string}** ended with no entries.`); continue }
      const shuffled = [...entries]
      const winners: string[] = []
      for (let i = 0; i < Math.min((giveaway.winners as number) || 1, shuffled.length); i++) {
        const idx = Math.floor(Math.random() * shuffled.length)
        winners.push(`<@${shuffled.splice(idx, 1)[0]}>`)
      }
      await db.collection('giveaways').updateOne({ _id: giveaway._id }, { $set: { winner: winners[0] } }).catch(() => {})
      await channel.send({
        embeds: [new EmbedBuilder().setColor('#5865f2').setTitle('🎉 Giveaway Ended!')
          .setDescription(`**Prize:** ${giveaway.prize as string}\n**Winner(s):** ${winners.join(', ')}`).setTimestamp()],
      })
    }
  }, 30000)
}
