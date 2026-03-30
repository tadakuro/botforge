import { GuildMember } from 'discord.js'
import { Db } from 'mongodb'

export async function handleAutoRoles(member: GuildMember, db: Db): Promise<void> {
  const config = await db.collection('modules').findOne({ key: 'auto-roles' })
  if (!config?.enabled || !(config.roles as unknown[])?.length) return

  for (const rule of config.roles as Array<{ roleId: string; type: string; delay?: number }>) {
    if (!rule.roleId) continue
    const isBot = member.user.bot
    if (rule.type === 'bots' && !isBot) continue
    if (rule.type === 'humans' && isBot) continue
    const delay = Number(rule.delay) || 0
    const assign = async () => {
      try {
        const fresh = await member.guild.members.fetch(member.id).catch(() => null)
        if (!fresh) return
        await fresh.roles.add(rule.roleId)
      } catch (err: unknown) {
        console.error('Auto-role error:', (err as Error).message)
      }
    }
    if (delay > 0) setTimeout(assign, delay * 1000)
    else await assign()
  }
}
