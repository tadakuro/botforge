export interface StatsData {
  connected: boolean
  bot?: {
    id: string
    username: string
    avatar?: string
  }
  guilds?: number
  totalMembers?: number
  commandCount?: number
  modCount?: number
  automodCount?: number
  activeGiveaways?: number
  uptimeSince?: string | null
}

export interface ModuleData {
  key: string
  enabled: boolean
  [key: string]: unknown
}

export interface ChannelData {
  id: string
  name: string
  parentId?: string
}

export interface CategoryData {
  id: string
  name: string
}
