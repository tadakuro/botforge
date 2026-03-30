'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, Field, Input, Select } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { BarChart2, Plus, Trash2 } from 'lucide-react'

function CreatePollForm({ onCreated }) {
  const [form, setForm] = useState({ question: '', channelId: '', options: ['', ''], duration: 60, multiVote: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function updateOption(i, value) {
    const opts = [...form.options]
    opts[i] = value
    setForm({ ...form, options: opts })
  }

  function addOption() {
    if (form.options.length < 10) setForm({ ...form, options: [...form.options, ''] })
  }

  function removeOption(i) {
    if (form.options.length > 2) setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const filledOptions = form.options.filter(o => o.trim())
    if (filledOptions.length < 2) {
      setError('At least 2 options are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/bot/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          options: filledOptions,
          endsAt: new Date(Date.now() + form.duration * 60000),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create poll')
      } else {
        setForm({ question: '', channelId: '', options: ['', ''], duration: 60, multiVote: false })
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
      <CardHeader title="Create Poll" description="Set up a new poll in any channel." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Question">
          <Input placeholder="What do you think about...?" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
        </Field>
        <Field label="Channel">
          <ChannelSelect value={form.channelId} onChange={v => setForm({ ...form, channelId: v })} />
        </Field>
        <div>
          <label className="block text-xs font-medium text-text-dim mb-2">Options</label>
          <div className="space-y-2 mb-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-5 text-right flex-shrink-0">{i + 1}.</span>
                <Input placeholder={`Option ${i + 1}`} value={opt} onChange={e => updateOption(i, e.target.value)} />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className="text-text-muted hover:text-danger transition-colors flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.options.length < 10 && (
            <button type="button" onClick={addOption} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors">
              <Plus size={12} /> Add option
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (minutes)">
            <Input type="number" min={1} value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} />
          </Field>
          <Field label="Vote Type">
            <Select value={form.multiVote ? 'multi' : 'single'} onChange={e => setForm({ ...form, multiVote: e.target.value === 'multi' })} className="w-full">
              <option value="single">Single choice</option>
              <option value="multi">Multiple choice</option>
            </Select>
          </Field>
        </div>
        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <button type="submit" disabled={loading || !form.question || !form.channelId}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium transition-all">
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </form>
    </Card>
  )
}

export default function PollsPage() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchPolls() {
    try {
      const res = await fetch('/api/bot/polls')
      const data = await res.json()
      setPolls(Array.isArray(data) ? data : [])
    } catch {
      setPolls([])
    } finally {
      setLoading(false)
    }
  }

  async function endPoll(id) {
    await fetch('/api/bot/polls', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'end' }),
    })
    fetchPolls()
  }

  useEffect(() => { fetchPolls() }, [])

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center">
            <BarChart2 size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">Polls</h1>
            <p className="text-sm text-text-muted">Create and manage polls in your server.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <CreatePollForm onCreated={fetchPolls} />
        <Card>
          <CardHeader title="Active & Recent Polls" />
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : polls.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No polls yet.</p>
          ) : (
            <div className="space-y-2">
              {polls.map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-bg-1 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-text">{p.question}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {p.options?.length} options · {Object.keys(p.votes || {}).length} votes ·{' '}
                      <span className={p.active ? 'text-success' : 'text-text-muted'}>{p.active ? 'Active' : 'Ended'}</span>
                    </p>
                  </div>
                  {p.active && (
                    <button onClick={() => endPoll(p._id)} className="text-xs px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 transition-all">
                      End
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
