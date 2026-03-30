'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, Field, Input } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { Webhook, Plus, Trash2, Copy, Check, Send } from 'lucide-react'

function WebhookCard({ hook, onDelete, onTest }) {
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [showTest, setShowTest] = useState(false)

  function copyUrl() {
    navigator.clipboard.writeText(hook.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleTest() {
    if (!testMsg.trim()) return
    setTesting(true)
    await fetch(hook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testMsg }),
    })
    setTesting(false)
    setTestMsg('')
    setShowTest(false)
  }

  return (
    <div className="p-4 bg-bg-1 rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hook.avatar ? (
            <img src={`https://cdn.discordapp.com/avatars/${hook.id}/${hook.avatar}.png`} alt=""
              className="w-9 h-9 rounded-full border border-border" onError={(e) => e.target.style.display='none'} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent-muted border border-accent/20 flex items-center justify-center">
              <Webhook size={14} className="text-accent" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-text">{hook.name}</p>
            <p className="text-xs text-text-muted">Channel ID: {hook.channel_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowTest(!showTest)}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-muted transition-all">
            <Send size={13} />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 bg-bg-2 rounded-lg border border-border">
        <p className="text-xs font-mono text-text-muted flex-1 truncate">{hook.url}</p>
        <button onClick={copyUrl}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-bg-3 hover:bg-bg-4 text-text-dim transition-all flex-shrink-0">
          {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {showTest && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Test message..."
            value={testMsg}
            onChange={(e) => setTestMsg(e.target.value)}
            className="flex-1"
          />
          <button onClick={handleTest} disabled={testing || !testMsg.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-medium transition-all flex-shrink-0">
            <Send size={12} />
            {testing ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', channelId: '', avatarUrl: '' })
  const [error, setError] = useState('')

  async function fetchWebhooks() {
    setLoading(true)
    try {
      const res = await fetch('/api/bot/webhooks')
      const data = await res.json()
      setWebhooks(Array.isArray(data) ? data : [])
    } catch {
      setWebhooks([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    const res = await fetch('/api/bot/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create webhook')
    } else {
      setForm({ name: '', channelId: '', avatarUrl: '' })
      fetchWebhooks()
    }
    setCreating(false)
  }

  async function handleDelete(webhookId) {
    await fetch('/api/bot/webhooks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookId }),
    })
    fetchWebhooks()
  }

  useEffect(() => { fetchWebhooks() }, [])

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center">
            <Webhook size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">Webhooks</h1>
            <p className="text-sm text-text-muted">Create, manage and test webhooks across your server.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader title="Create Webhook" description="Create a new webhook in any channel." />
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Webhook Name">
                <Input placeholder="e.g. Announcements" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Channel">
                <ChannelSelect value={form.channelId} onChange={v => setForm({ ...form, channelId: v })} />
              </Field>
            </div>
            <Field label="Avatar URL" hint="Optional — leave empty to use the default Discord webhook avatar">
              <Input placeholder="https://..." value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
            </Field>
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20">
                <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            <button type="submit" disabled={creating || !form.name || !form.channelId}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium transition-all shadow-glow-sm">
              <Plus size={14} />
              {creating ? 'Creating...' : 'Create Webhook'}
            </button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-text">Existing Webhooks</p>
              <p className="text-xs text-text-muted mt-0.5">All webhooks across your servers</p>
            </div>
            <button onClick={fetchWebhooks} className="text-xs text-accent hover:underline">Refresh</button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No webhooks found.</p>
          ) : (
            <div className="space-y-3">
              {webhooks.map((hook) => (
                <WebhookCard key={hook.id} hook={hook} onDelete={() => handleDelete(hook.id)} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
