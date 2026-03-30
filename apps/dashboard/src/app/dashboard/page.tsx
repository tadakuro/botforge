'use client'

import { useEffect, useState } from 'react'
import BotOverviewCard from '@/components/stats/BotOverviewCard'
import ServerStatsCard from '@/components/stats/ServerStatsCard'
import CommandStatsCard from '@/components/stats/CommandStatsCard'
import ModActivityCard from '@/components/stats/ModActivityCard'
import GiveawayStatusCard from '@/components/stats/GiveawayStatusCard'
import BotStatusCard from '@/components/stats/BotStatusCard'
import UptimeCard from '@/components/stats/UptimeCard'
import BotConnectForm from '@/components/ui/BotConnectForm'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    try {
      const res = await fetch('/api/bot/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      setStats({ connected: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats?.connected) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Connect your bot to get started</p>
        </div>
        <BotConnectForm onConnected={fetchStats} />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Overview of your bot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BotOverviewCard bot={stats.bot} />
        <ServerStatsCard guilds={stats.guilds} totalMembers={stats.totalMembers} />
        <UptimeCard uptimeSince={stats.uptimeSince} />
        <CommandStatsCard count={stats.commandCount} />
        <ModActivityCard modCount={stats.modCount} automodCount={stats.automodCount} />
        <GiveawayStatusCard active={stats.activeGiveaways} />
        <BotStatusCard />
      </div>

      <div className="mt-6 p-4 bg-bg-2 border border-border rounded-xl flex items-center justify-between">
        <p className="text-xs text-text-muted">Bot token is securely stored in your database.</p>
        <button onClick={fetchStats} className="text-xs text-accent hover:underline">Refresh</button>
      </div>
    </div>
  )
}
