'use client'

import { useEffect, useState } from 'react'
import { Save, Power } from 'lucide-react'

export default function ModulePanel({ title, description, icon: Icon, apiPath, children }) {
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saved' | 'error'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})

  useEffect(() => {
    fetch(`/api/bot/${apiPath}`)
      .then(r => r.json())
      .then(d => {
        const { _id, key, updatedAt, ...rest } = d
        setEnabled(rest.enabled || false)
        setData(rest)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [apiPath])

  async function handleSave() {
    setSaving(true)
    setSaveStatus(null)
    try {
      const { _id, key, updatedAt, ...cleanData } = data
      const res = await fetch(`/api/bot/${apiPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleanData, enabled }),
      })
      if (res.ok) {
        setSaveStatus('saved')
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 2500)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted">Loading module...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-accent-muted border border-accent/20' : 'bg-bg-3 border border-border'}`}>
              <Icon size={18} className={enabled ? 'text-accent' : 'text-text-muted'} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-text">{title}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                enabled ? 'bg-success/10 text-success border border-success/20' : 'bg-bg-3 text-text-muted border border-border'
              }`}>
                <span className={`w-1 h-1 rounded-full ${enabled ? 'bg-success animate-pulse-dot' : 'bg-text-muted'}`} />
                {enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {saveStatus === 'saved' && <span className="text-xs text-success">Saved ✓</span>}
          {saveStatus === 'error' && <span className="text-xs text-danger">Save failed</span>}
          <button
            onClick={() => setEnabled(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              enabled
                ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                : 'bg-bg-3 text-text-muted border border-border hover:text-text hover:bg-bg-4'
            }`}
          >
            <Power size={13} />
            {enabled ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-all shadow-glow-sm"
          >
            <Save size={13} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {typeof children === 'function' ? children({ data, setData, enabled }) : children}
      </div>
    </div>
  )
}
