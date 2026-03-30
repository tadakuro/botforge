'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, Field, Input } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { Gift, Trophy } from 'lucide-react'

function CreateGiveawayForm({ onCreated }) {
  const [form, setForm] = useState({ prize: '', channelId: '', duration: 60, winners: 1, requiredRole: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/bot/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          endsAt: new Date(Date.now() + form.duration * 60000),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create giveaway')
      } else {
        setForm({ prize: '', channelId: '', duration: 60, winners: 1, requiredRole: '' })
        if (onCreated) onCreated()
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Create Giveaway" description="Start a new giveaway in any channel." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Prize">
          <Input placeholder="What are you giving away?" value={form.prize} onChange={e => setForm({ ...form, prize: e.target.value })} />
        </Field>
        <Field label="Channel">
          <ChannelSelect value={form.channelId} onChange={v => setForm({ ...form, channelId: v })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (minutes)">
            <Input type="number" min={1} value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} />
          </Field>
          <Field label="Winners">
            <Input type="number" min={1} max={20} value={form.winners} onChange={e => setForm({ ...form, winners: parseInt(e.target.value) || 1 })} />
          </Field>
        </div>
        <Field label="Required Role ID" hint="Leave empty — anyone can enter">
          <Input placeholder="Role ID (optional)" value={form.requiredRole} onChange={e => setForm({ ...form, requiredRole: e.target.value })} />
        </Field>
        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <button type="submit" disabled={loading || !form.prize || !form.channelId}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium transition-all shadow-glow-sm">
          {loading ? 'Creating...' : '🎉 Create Giveaway'}
        </button>
      </form>
    </Card>
  )
}

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchGiveaways() {
    try {
      const res = await fetch('/api/bot/giveaways')
      const data = await res.json()
      setGiveaways(Array.isArray(data) ? data : [])
    } catch {
      setGiveaways([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id, action) {
    await fetch('/api/bot/giveaways', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    fetchGiveaways()
  }

  useEffect(() => { fetchGiveaways() }, [])

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center">
            <Gift size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">Giveaways</h1>
            <p className="text-sm text-text-muted">Create and manage giveaways in your server.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <CreateGiveawayForm onCreated={fetchGiveaways} />
        <Card>
          <CardHeader title="All Giveaways" />
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : giveaways.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No giveaways yet.</p>
          ) : (
            <div className="space-y-2">
              {giveaways.map(g => (
                <div key={g._id} className="flex items-center justify-between p-3.5 bg-bg-1 rounded-lg border border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text">{g.prize}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${g.active ? 'bg-success/10 text-success border border-success/20' : 'bg-bg-3 text-text-muted border border-border'}`}>
                        {g.active ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {g.winners} winner(s) · {g.entries?.length || 0} entries
                      {g.winner && ` · Winner: <@${g.winner}>`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {g.active && (
                      <button onClick={() => handleAction(g._id, 'end')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 transition-all">
                        End
                      </button>
                    )}
                    <button onClick={() => handleAction(g._id, 'reroll')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-accent-muted text-accent hover:bg-accent/20 border border-accent/20 transition-all flex items-center gap-1">
                      <Trophy size={11} /> Reroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
