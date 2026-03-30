export interface GuildConfig {
  key: string
  token?: string
  botId?: string
  updatedAt?: Date
}

export interface BotStatus {
  key: string
  presence: 'online' | 'idle' | 'dnd' | 'invisible'
  activityType: 'PLAYING' | 'WATCHING' | 'LISTENING' | 'COMPETING' | 'STREAMING' | 'CUSTOM'
  activityText: string
  streamUrl?: string
}
