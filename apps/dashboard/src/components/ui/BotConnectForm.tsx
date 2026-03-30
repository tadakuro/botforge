'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'

export default function BotConnectForm({ onConnected }) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bot/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to connect bot')
      } else {
        setToken('')
        if (onConnected) onConnected()
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="bg-bg-2 border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center">
            <Link2 size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Connect Your Bot</h2>
            <p className="text-xs text-text-muted">Paste your Discord bot token to get started</p>
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5">Bot Token</label>
            <input
              type="password"
              placeholder="MTA...XXXXX.XXXXXX.XXXXXXXXXXX"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-1 border border-border text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm font-mono transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20">
              <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-glow-sm"
          >
            {loading ? 'Connecting...' : 'Connect Bot'}
          </button>
        </form>

        <p className="text-xs text-text-muted mt-4">
          Find your token in the{' '}
          <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Discord Developer Portal
          </a>{' '}
          → Bot → Reset Token
        </p>
      </div>
    </div>
  )
}
