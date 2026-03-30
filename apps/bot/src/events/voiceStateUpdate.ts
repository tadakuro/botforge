import { VoiceState } from 'discord.js'
import { Db } from 'mongodb'
import { onVoiceUpdate } from '../modules/logging'

export default {
  name: 'voiceStateUpdate',
  once: false,
  async execute(_client: unknown, db: Db, oldState: VoiceState, newState: VoiceState) {
    await onVoiceUpdate(oldState, newState, db)
  },
}
