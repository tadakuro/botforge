'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

export default function BotOverviewCard({ bot }) {
  const [status, setStatus] = useState(null)

  const avatarUrl = bot?.avatar
    ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`
    : null

  const railwayProjectId = process.env.NEXT_PUBLIC_RAILWAY_PROJECT_ID
  const railwayUrl = railwayProjectId
    ? `https://railway.com/project/${railwayProjectId}`
    : 'https://railway.com'

  async function fetchStatus() {
    try {
      const res = await fetch('/api/bot/control')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ online: false })
    }
  }

  useEffect(() => { fetchStatus() }, [])

  const isOnline = status?.online
  const statusLabel = status === null ? 'Checking...' : isOnline ? 'Online' : 'Offline'

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-card col-span-2">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Bot Status</p>
        <div className="flex items-center gap-2">
          <button onClick={fetchStatus} className="text-xs text-text-muted hover:text-accent transition-colors">Refresh</button>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            status === null ? 'bg-bg-3 text-text-muted' :
            isOnline ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === null ? 'bg-text-muted' : isOnline ? 'bg-success animate-pulse-dot' : 'bg-danger'}`} />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center overflow-hidden flex-shrink-0 shadow-glow-sm">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Bot avatar" width={56} height={56} className="rounded-2xl" />
          ) : (
            <span className="text-white font-bold text-2xl">{bot?.username?.[0]?.toUpperCase() || 'B'}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-text text-base">{bot?.username || 'Unknown Bot'}</p>
          <p className="text-xs text-text-muted mt-0.5 font-mono">ID: {bot?.id || '—'}</p>
        </div>
      </div>

      <a
        href={railwayUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-bg-3 hover:bg-bg-4 border border-border text-text-muted hover:text-text text-xs font-medium transition-all"
      >
        <ExternalLink size={12} />
        Manage on Railway
      </a>
    </div>
  )
}
