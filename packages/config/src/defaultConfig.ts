export const DEFAULT_MODULE_CONFIG = {
  moderation: { enabled: false },
  automod: { enabled: false, action: 'delete' },
  welcome: { enabled: false },
  logging: { enabled: false },
  'auto-roles': { enabled: false },
  'reaction-roles': { enabled: false },
  embeds: { enabled: false },
}

export const BUILTIN_COMMANDS = [
  {
    name: 'ban', description: 'Ban a member',
    options: [
      { type: 6, name: 'user', description: 'User to ban', required: true },
      { type: 3, name: 'reason', description: 'Reason' },
    ],
  },
  {
    name: 'kick', description: 'Kick a member',
    options: [
      { type: 6, name: 'user', description: 'User to kick', required: true },
      { type: 3, name: 'reason', description: 'Reason' },
    ],
  },
  {
    name: 'warn', description: 'Warn a member',
    options: [
      { type: 6, name: 'user', description: 'User to warn', required: true },
      { type: 3, name: 'reason', description: 'Reason' },
    ],
  },
  {
    name: 'timeout', description: 'Timeout a member',
    options: [
      { type: 6, name: 'user', description: 'User to timeout', required: true },
      { type: 4, name: 'minutes', description: 'Duration in minutes' },
      { type: 3, name: 'reason', description: 'Reason' },
    ],
  },
  {
    name: 'purge', description: 'Bulk delete messages',
    options: [
      { type: 4, name: 'amount', description: 'Number of messages to delete', required: true },
    ],
  },
]
