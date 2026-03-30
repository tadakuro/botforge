'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, Field, Input, Textarea, Select } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { Clock, Trash2 } from 'lucide-react'

function CreateScheduleForm({ onCreated }) {
  const [form, setForm] = useState({ message: '', channelId: '', scheduledAt: '', repeat: 'none' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/bot/scheduled-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt) }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to schedule message')
      } else {
        setForm({ message: '', channelId: '', scheduledAt: '', repeat: 'none' })
        if (onCreated) onCreated()
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Schedule a Message" description="Set a message to be sent at a specific date and time." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Channel">
          <ChannelSelect value={form.channelId} onChange={v => setForm({ ...form, channelId: v })} />
        </Field>
        <Field label="Message">
          <Textarea placeholder="What should the bot say?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Send At (local time)">
            <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
          </Field>
          <Field label="Repeat">
            <Select value={form.repeat} onChange={e => setForm({ ...form, repeat: e.target.value })} className="w-full">
              <option value="none">No repeat</option>
              <option value="hourly">Every hour</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
            </Select>
          </Field>
        </div>
        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <button type="submit" disabled={loading || !form.message || !form.channelId || !form.scheduledAt}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium transition-all">
          {loading ? 'Scheduling...' : 'Schedule Message'}
        </button>
      </form>
    </Card>
  )
}

export default function ScheduledMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchMessages() {
    try {
      const res = await fetch('/api/bot/scheduled-messages')
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function deleteMessage(id) {
    await fetch('/api/bot/scheduled-messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchMessages()
  }

  useEffect(() => { fetchMessages() }, [])

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center">
            <Clock size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">Scheduled Messages</h1>
            <p className="text-sm text-text-muted">Send messages automatically at a set time.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <CreateScheduleForm onCreated={fetchMessages} />
        <Card>
          <CardHeader title="Scheduled Messages" />
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No scheduled messages.</p>
          ) : (
            <div className="space-y-2">
              {messages.map(m => (
                <div key={m._id} className="flex items-start justify-between p-3 bg-bg-1 rounded-lg border border-border gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-text truncate">{m.message}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(m.scheduledAt).toLocaleString()}
                      {m.repeat !== 'none' ? ` · Repeats ${m.repeat}` : ''}
                      {m.sent ? ' · Sent' : ''}
                      {m.error ? ` · Error: ${m.error}` : ''}
                    </p>
                  </div>
                  <button onClick={() => deleteMessage(m._id)} className="text-text-muted hover:text-danger transition-colors flex-shrink-0 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
