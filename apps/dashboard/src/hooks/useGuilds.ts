'use client'
import { useEffect, useState } from 'react'
import type { StatsData } from '@/types'

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchStats() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bot/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      setError('Failed to load stats')
      setStats({ connected: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])
  return { stats, loading, error, refetch: fetchStats }
}

export function useChannels() {
  const [channels, setChannels] = useState<{ id: string; name: string; parentId?: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bot/channels')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setChannels(data.channels || [])
        setCategories(data.categories || [])
      })
      .catch(() => setError('Failed to load channels'))
      .finally(() => setLoading(false))
  }, [])

  return { channels, categories, loading, error }
}
