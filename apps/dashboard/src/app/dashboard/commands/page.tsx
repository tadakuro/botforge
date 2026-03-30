'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, ChevronRight, Terminal, RefreshCw } from 'lucide-react'

const DEFAULT_CODE = `// Available: interaction, client
// Use editReply — deferReply is called automatically before this runs

module.exports = async (interaction) => {
  await interaction.editReply({ content: 'Hello!' })
}`

export default function CommandsPage() {
  const [commands, setCommands] = useState([])
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState('')
  const [commandName, setCommandName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [registerStatus, setRegisterStatus] = useState(null)

  async function fetchCommands() {
    setLoading(true)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('/api/bot/commands', { signal: controller.signal })
      clearTimeout(timeout)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load commands')
        setCommands([])
      } else {
        setCommands(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Check your connection.')
      } else {
        setError('Failed to load commands')
      }
      setCommands([])
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    setRegistering(true)
    setRegisterStatus(null)
    try {
      const res = await fetch('/api/bot/register', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setRegisterStatus({ ok: false, msg: data.error || 'Failed to register' })
      } else {
        setRegisterStatus({ ok: true, msg: `Registered ${data.count} command(s)` })
        setTimeout(() => setRegisterStatus(null), 4000)
      }
    } catch {
      setRegisterStatus({ ok: false, msg: 'Network error' })
    } finally {
      setRegistering(false)
    }
  }

  useEffect(() => { fetchCommands() }, [])

  function selectCommand(cmd) {
    setSelected(cmd)
    setCode(cmd.code || DEFAULT_CODE)
    setCommandName(cmd.name || '')
    setDescription(cmd.description || '')
    setSaveStatus(null)
  }

  function newCommand() {
    setSelected(null)
    setCode(DEFAULT_CODE)
    setCommandName('')
    setDescription('')
    setSaveStatus(null)
  }

  async function handleSave() {
    if (!commandName.trim()) return
    setSaving(true)
    setSaveStatus(null)

    const payload = {
      name: commandName.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
      description: description.trim() || `Custom command: ${commandName}`,
      code,
    }

    try {
      let res
      if (selected?._id) {
        res = await fetch('/api/bot/commands', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selected._id, ...payload }),
        })
        if (res.ok) {
          const updated = { ...selected, ...payload }
          setCommands(prev => prev.map(c => c._id === selected._id ? updated : c))
          setSelected(updated)
        }
      } else {
        res = await fetch('/api/bot/commands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          const newCmd = { _id: data.id?.toString(), ...payload }
          setCommands(prev => [...prev, newCmd])
          setSelected(newCmd)
        }
      }
      if (res.ok) {
        setSaveStatus({ ok: true, msg: 'Saved!' })
        setTimeout(() => setSaveStatus(null), 2000)
      } else {
        setSaveStatus({ ok: false, msg: 'Save failed' })
      }
    } catch {
      setSaveStatus({ ok: false, msg: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selected?._id) return
    setDeleting(true)
    try {
      await fetch('/api/bot/commands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected._id }),
      })
      setCommands(prev => prev.filter(c => c._id !== selected._id))
      setSelected(null)
      setCode(DEFAULT_CODE)
      setCommandName('')
      setDescription('')
    } finally {
      setDeleting(false)
    }
  }

  const showEditor = selected !== null || commandName !== ''

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 animate-fadeIn">
      {/* Sidebar */}
      <div className="w-60 bg-bg-1 border-r border-border flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-text-muted" />
            <p className="text-xs font-semibold text-text">Commands</p>
          </div>
          <button onClick={newCommand} className="w-6 h-6 rounded-md bg-accent-muted text-accent hover:bg-accent/20 border border-accent/20 flex items-center justify-center transition-all">
            <Plus size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <button onClick={() => setLoading(false)} className="text-xs text-text-muted hover:text-accent">
                Cancel
              </button>
            </div>
          ) : error ? (
            <div className="text-center py-6 px-2 space-y-2">
              <p className="text-xs text-danger">{error}</p>
              <button onClick={fetchCommands} className="text-xs text-accent hover:underline">Retry</button>
            </div>
          ) : commands.length === 0 ? (
            <div className="text-center py-8 px-3">
              <p className="text-xs text-text-muted mb-2">No commands yet.</p>
              <button onClick={newCommand} className="text-xs text-accent hover:underline">Create your first command</button>
            </div>
          ) : (
            commands.map(cmd => (
              <button key={cmd._id} onClick={() => selectCommand(cmd)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  selected?._id === cmd._id
                    ? 'bg-accent-muted text-accent border border-accent/20'
                    : 'text-text-muted hover:text-text hover:bg-bg-3'
                }`}>
                <span className="text-xs font-mono flex-1 truncate">/{cmd.name}</span>
                <ChevronRight size={11} className="flex-shrink-0 opacity-40" />
              </button>
            ))
          )}
        </div>

        {/* Register button — always visible regardless of loading state */}
        <div className="p-2 border-t border-border space-y-1.5">
          {registerStatus && (
            <p className={`text-xs px-2 py-1 rounded ${registerStatus.ok ? 'text-success' : 'text-danger'}`}>
              {registerStatus.msg}
            </p>
          )}
          <button onClick={handleRegister} disabled={registering}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-bg-3 hover:bg-bg-4 border border-border text-text-muted hover:text-text text-xs font-medium transition-all disabled:opacity-50">
            <RefreshCw size={11} className={registering ? 'animate-spin' : ''} />
            {registering ? 'Registering...' : 'Register Commands'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-[#080b0f]">
        {showEditor ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-bg-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-text-muted text-sm font-mono flex-shrink-0">/</span>
                <input type="text" placeholder="command-name" value={commandName}
                  onChange={e => setCommandName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="bg-transparent text-sm font-mono text-text placeholder-text-muted focus:outline-none w-36" />
                <span className="text-border flex-shrink-0">|</span>
                <input type="text" placeholder="Short description" value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-transparent text-sm text-text-muted placeholder-text-muted focus:outline-none flex-1 min-w-0" />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {saveStatus && (
                  <span className={`text-xs ${saveStatus.ok ? 'text-success' : 'text-danger'}`}>{saveStatus.msg}</span>
                )}
                {selected?._id && (
                  <button onClick={handleDelete} disabled={deleting}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-50">
                    <Trash2 size={13} />
                  </button>
                )}
                <button onClick={handleSave} disabled={saving || !commandName.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-all shadow-glow-sm">
                  <Save size={12} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
                className="absolute inset-0 w-full h-full bg-transparent text-[#e2e8f0] font-mono text-sm p-5 focus:outline-none resize-none leading-relaxed"
                style={{ tabSize: 2 }}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.target.selectionStart
                    const end = e.target.selectionEnd
                    const newCode = code.substring(0, start) + '  ' + code.substring(end)
                    setCode(newCode)
                    setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2 }, 0)
                  }
                }} />
            </div>

            <div className="px-5 py-2 border-t border-border bg-bg-1 flex items-center justify-between">
              <p className="text-xs text-text-muted">Use <code className="font-mono text-accent">interaction.editReply()</code> — deferReply is called automatically</p>
              <p className="text-xs text-text-muted">Save then click Register Commands</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-muted border border-accent/20 flex items-center justify-center">
              <Terminal size={20} className="text-accent" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text">No command selected</p>
              <p className="text-xs text-text-muted mt-1">Pick one from the list or create a new one</p>
            </div>
            <button onClick={newCommand}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all shadow-glow-sm">
              <Plus size={14} /> New Command
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
