'use client'

import { useEffect, useState } from 'react'

function formatUptime(since) {
  if (!since) return '—'
  const diff = Date.now() - new Date(since).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) { const d = Math.floor(h / 24); return `${d}d ${h % 24}h` }
  return `${h}h ${m}m`
}

export default function UptimeCard({ uptimeSince }) {
  const [uptime, setUptime] = useState(formatUptime(uptimeSince))

  useEffect(() => {
    if (!uptimeSince) return
    const interval = setInterval(() => setUptime(formatUptime(uptimeSince)), 60000)
    return () => clearInterval(interval)
  }, [uptimeSince])

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-card">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Uptime</p>
      <p className="text-3xl font-bold text-text font-mono tabular-nums">{uptime}</p>
      <p className="text-xs text-text-muted mt-1">Since last restart</p>
    </div>
  )
}
