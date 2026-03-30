export interface ModuleConfig {
  key: string
  enabled: boolean
  updatedAt?: Date
  [key: string]: unknown
}

export interface CustomCommand {
  _id?: string
  name: string
  description: string
  code: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Poll {
  _id?: string
  question: string
  channelId: string
  options: string[]
  endsAt: Date
  multiVote: boolean
  active: boolean
  votes: Record<string, number>
  messageId?: string
  createdAt?: Date
}

export interface Giveaway {
  _id?: string
  prize: string
  channelId: string
  endsAt: Date
  winners: number
  requiredRole?: string
  active: boolean
  entries: string[]
  messageId?: string
  winner?: string
  createdAt?: Date
}

export interface ScheduledMessage {
  _id?: string
  message: string
  channelId: string
  scheduledAt: Date
  repeat: 'none' | 'hourly' | 'daily' | 'weekly'
  sent: boolean
  error?: string
  createdAt?: Date
}

export interface TrackerEntry {
  type: 'command' | 'mod_action' | 'automod'
  command?: string
  action?: string
  reason?: string
  userId: string
  guildId?: string
  at: Date
}
