'use client'

import { useEffect, useState } from 'react'
import { Activity, Save } from 'lucide-react'

const PRESENCE_OPTIONS = [
  { value: 'online', label: 'Online', color: 'bg-success' },
  { value: 'idle', label: 'Idle', color: 'bg-warning' },
  { value: 'dnd', label: 'Do Not Disturb', color: 'bg-danger' },
  { value: 'invisible', label: 'Invisible', color: 'bg-text-muted' },
]

const ACTIVITY_TYPES = [
  { value: 'PLAYING', label: 'Playing' },
  { value: 'WATCHING', label: 'Watching' },
  { value: 'LISTENING', label: 'Listening to' },
  { value: 'COMPETING', label: 'Competing in' },
  { value: 'STREAMING', label: 'Streaming' },
  { value: 'CUSTOM', label: 'Custom' },
]

export default function BotStatusCard() {
  const [status, setStatus] = useState({ presence: 'online', activityType: 'PLAYING', activityText: '', streamUrl: '' })
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bot/status')
      .then(r => r.json())
      .then(d => { const { _id, key, updatedAt, ...rest } = d; setStatus(rest) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch('/api/bot/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 2500)
    }
  }

  const currentPresence = PRESENCE_OPTIONS.find(p => p.value === status.presence) || PRESENCE_OPTIONS[0]

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-text-muted" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Bot Status</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && <span className="text-xs text-success">Saved ✓</span>}
          {saveStatus === 'error' && <span className="text-xs text-danger">Save failed</span>}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-muted text-accent hover:bg-accent/20 border border-accent/20 disabled:opacity-50 text-xs font-medium transition-all"
          >
            <Save size={11} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5">Presence</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus({ ...status, presence: opt.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    status.presence === opt.value
                      ? 'bg-accent-muted text-accent border-accent/20'
                      : 'bg-bg-1 text-text-muted border-border hover:text-text hover:bg-bg-3'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.color}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5">Activity Type</label>
            <select
              value={status.activityType}
              onChange={e => setStatus({ ...status, activityType: e.target.value, streamUrl: e.target.value !== 'STREAMING' ? '' : status.streamUrl })}
              className="w-full px-3 py-2 rounded-lg bg-bg-1 border border-border text-text focus:outline-none focus:border-accent text-xs transition-all"
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5">
              {status.activityType === 'STREAMING' ? 'Stream Title' : 'Activity Text'}
            </label>
            <input
              type="text"
              placeholder={
                status.activityType === 'PLAYING' ? 'Minecraft' :
                status.activityType === 'WATCHING' ? 'over the server' :
                status.activityType === 'LISTENING' ? 'lo-fi beats' :
                status.activityType === 'COMPETING' ? 'a tournament' :
                status.activityType === 'STREAMING' ? 'Chill stream' :
                'your status here'
              }
              value={status.activityText || ''}
              onChange={e => setStatus({ ...status, activityText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-bg-1 border border-border text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-xs transition-all"
            />
          </div>

          {status.activityType === 'STREAMING' && (
            <div>
              <label className="block text-xs font-medium text-text-dim mb-1.5">Stream URL</label>
              <input
                type="text"
                placeholder="https://twitch.tv/yourchannel"
                value={status.streamUrl || ''}
                onChange={e => setStatus({ ...status, streamUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-bg-1 border border-border text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-xs transition-all"
              />
              <p className="text-xs text-text-muted mt-1">Twitch or YouTube URL. Shows purple LIVE badge on bot.</p>
            </div>
          )}

          {status.activityText && (
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-1 rounded-lg border border-border">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentPresence.color}`} />
              <span className="text-xs text-text-muted truncate">
                {status.activityType === 'STREAMING' ? '🟣 Live on Twitch' :
                 status.activityType === 'PLAYING' ? `Playing ${status.activityText}` :
                 status.activityType === 'WATCHING' ? `Watching ${status.activityText}` :
                 status.activityType === 'LISTENING' ? `Listening to ${status.activityText}` :
                 status.activityType === 'COMPETING' ? `Competing in ${status.activityText}` :
                 status.activityText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
