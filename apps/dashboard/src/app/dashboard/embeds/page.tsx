'use client'

import { useState } from 'react'
import ModulePanel from '@/components/modules/ModulePanel'
import { Card, CardHeader, Field, Input, Textarea } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { Layers, Plus, Trash2, Send } from 'lucide-react'

function EmbedBuilder({ data, setData }) {
  const embed = data.draft || {}
  const fields = embed.fields || []
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState(null)

  function update(field, value) {
    setData({ ...data, draft: { ...embed, [field]: value } })
  }

  function addField() {
    update('fields', [...fields, { name: '', value: '', inline: false }])
  }

  function updateField(i, key, value) {
    update('fields', fields.map((f, idx) => idx === i ? { ...f, [key]: value } : f))
  }

  function removeField(i) {
    update('fields', fields.filter((_, idx) => idx !== i))
  }

  async function handleSend() {
    setSending(true)
    setSendStatus(null)
    try {
      const res = await fetch('/api/bot/embeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', embed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSendStatus({ ok: false, msg: data.error || 'Failed to send' })
      } else {
        setSendStatus({ ok: true, msg: 'Embed sent!' })
        setTimeout(() => setSendStatus(null), 3000)
      }
    } catch {
      setSendStatus({ ok: false, msg: 'Network error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader title="Embed Content" />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Author Name"><Input placeholder="Author" value={embed.authorName || ''} onChange={e => update('authorName', e.target.value)} /></Field>
            <Field label="Author Icon URL"><Input placeholder="https://..." value={embed.authorIcon || ''} onChange={e => update('authorIcon', e.target.value)} /></Field>
          </div>
          <Field label="Title"><Input placeholder="Embed title" value={embed.title || ''} onChange={e => update('title', e.target.value)} /></Field>
          <Field label="Description"><Textarea placeholder="Embed description..." value={embed.description || ''} onChange={e => update('description', e.target.value)} rows={4} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thumbnail URL"><Input placeholder="https://..." value={embed.thumbnail || ''} onChange={e => update('thumbnail', e.target.value)} /></Field>
            <Field label="Image URL"><Input placeholder="https://..." value={embed.image || ''} onChange={e => update('image', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Footer Text"><Input placeholder="Footer" value={embed.footer || ''} onChange={e => update('footer', e.target.value)} /></Field>
            <Field label="Accent Color">
              <div className="flex items-center gap-2">
                <input type="color" value={embed.color || '#5865f2'} onChange={e => update('color', e.target.value)} className="w-10 h-9 rounded-lg border border-border bg-bg-1 cursor-pointer p-0.5" />
                <Input placeholder="#5865f2" value={embed.color || ''} onChange={e => update('color', e.target.value)} />
              </div>
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Fields" description="Add up to 25 fields." />
        <div className="space-y-2 mb-3">
          {fields.map((field, i) => (
            <div key={i} className="p-3 bg-bg-1 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">Field #{i + 1}</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                    <input type="checkbox" checked={field.inline || false} onChange={e => updateField(i, 'inline', e.target.checked)} className="accent-accent" />
                    Inline
                  </label>
                  <button onClick={() => removeField(i)} className="text-text-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <Input placeholder="Field name" value={field.name} onChange={e => updateField(i, 'name', e.target.value)} />
              <Input placeholder="Field value" value={field.value} onChange={e => updateField(i, 'value', e.target.value)} />
            </div>
          ))}
        </div>
        <button onClick={addField} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border-bright text-text-muted hover:text-accent hover:border-accent/40 text-sm transition-all w-full justify-center">
          <Plus size={14} /> Add Field
        </button>
      </Card>

      {(embed.title || embed.description) && (
        <Card>
          <CardHeader title="Preview" />
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="flex gap-3 p-4 bg-bg-3" style={{ borderLeft: `4px solid ${embed.color || '#5865f2'}` }}>
              <div className="flex-1 min-w-0">
                {embed.authorName && <p className="text-xs text-text-muted mb-1">{embed.authorName}</p>}
                {embed.title && <p className="font-semibold text-text text-sm mb-1">{embed.title}</p>}
                {embed.description && <p className="text-sm text-text-dim whitespace-pre-wrap">{embed.description}</p>}
                {fields.filter(f => f.name && f.value).length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {fields.filter(f => f.name && f.value).map((f, i) => (
                      <div key={i} className="bg-bg-1 rounded p-2">
                        <p className="text-[10px] text-text-muted uppercase font-semibold">{f.name}</p>
                        <p className="text-sm text-text">{f.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {embed.footer && <p className="text-xs text-text-muted mt-3 pt-2 border-t border-border">{embed.footer}</p>}
              </div>
              {embed.thumbnail && <img src={embed.thumbnail} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Send Embed" description="Send this embed to a channel immediately." />
        <div className="space-y-3">
          <Field label="Channel">
            <ChannelSelect value={embed.channelId || ''} onChange={v => update('channelId', v)} />
          </Field>
          {sendStatus && (
            <p className={`text-xs px-3 py-2 rounded-lg border ${sendStatus.ok ? 'text-success bg-success/10 border-success/20' : 'text-danger bg-danger/10 border-danger/20'}`}>
              {sendStatus.msg}
            </p>
          )}
          <button
            onClick={handleSend}
            disabled={sending || !embed.channelId || (!embed.title && !embed.description)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium transition-all"
          >
            <Send size={13} />
            {sending ? 'Sending...' : 'Send Embed'}
          </button>
        </div>
      </Card>
    </>
  )
}

export default function EmbedsPage() {
  return (
    <ModulePanel title="Embeds" description="Build and send rich embed messages to any channel." icon={Layers} apiPath="embeds">
      {({ data, setData }) => <EmbedBuilder data={data} setData={setData} />}
    </ModulePanel>
  )
}
