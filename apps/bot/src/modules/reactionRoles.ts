import { Client, MessageReaction, User } from 'discord.js'
import { Db } from 'mongodb'

export function initReactionRoles(client: Client, db: Db): void {
  async function handle(reaction: MessageReaction, user: User, add: boolean) {
    if (user.bot) return
    if (reaction.partial) { try { await reaction.fetch() } catch { return } }
    const config = await db.collection('modules').findOne({ key: 'reaction-roles' })
    if (!config?.enabled || !(config.rules as unknown[])?.length) return
    const emoji = reaction.emoji.id
      ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
      : reaction.emoji.name
    const rule = (config.rules as Array<{ emoji: string; messageId: string; roleId: string; mode?: string }>)
      .find(r => (r.emoji === emoji || r.emoji === reaction.emoji.name) && r.messageId === reaction.message.id)
    if (!rule?.roleId) return
    const mode = rule.mode || 'toggle'
    try {
      const member = await reaction.message.guild!.members.fetch(user.id)
      if (add) {
        if (mode === 'remove') return
        await member.roles.add(rule.roleId)
      } else {
        if (mode === 'add') return
        await member.roles.remove(rule.roleId)
      }
    } catch (err: unknown) {
      console.error('Reaction role error:', (err as Error).message)
    }
  }

  client.on('messageReactionAdd', (r, u) => handle(r as MessageReaction, u as User, true))
  client.on('messageReactionRemove', (r, u) => handle(r as MessageReaction, u as User, false))
}
