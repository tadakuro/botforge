'use client'

import ModulePanel from '@/components/modules/ModulePanel'
import { Card, CardHeader, Field, Input, Select } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { Star, Plus, Trash2 } from 'lucide-react'

function ReactionRolesList({ data, setData }) {
  const rules = data.rules || []

  function addRule() {
    setData({ ...data, rules: [...rules, { emoji: '', roleId: '', messageId: '', channelId: '', mode: 'toggle' }] })
  }

  function updateRule(i, field, value) {
    setData({ ...data, rules: rules.map((r, idx) => idx === i ? { ...r, [field]: value } : r) })
  }

  function removeRule(i) {
    setData({ ...data, rules: rules.filter((_, idx) => idx !== i) })
  }

  return (
    <Card>
      <CardHeader title="Reaction Role Rules" description="Each rule links a reaction emoji on a specific message to a role." />
      <div className="space-y-3 mb-3">
        {rules.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">No rules yet. Add one below.</p>
        )}
        {rules.map((rule, i) => (
          <div key={i} className="p-4 bg-bg-1 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-text-dim uppercase tracking-wider">Rule #{i + 1}</p>
              <button onClick={() => removeRule(i)} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Emoji">
                <Input placeholder="🎉 or :customemoji:" value={rule.emoji} onChange={e => updateRule(i, 'emoji', e.target.value)} />
              </Field>
              <Field label="Role ID">
                <Input placeholder="Role ID" value={rule.roleId} onChange={e => updateRule(i, 'roleId', e.target.value)} />
              </Field>
              <Field label="Message ID" hint="Right-click message → Copy ID">
                <Input placeholder="Message ID" value={rule.messageId} onChange={e => updateRule(i, 'messageId', e.target.value)} />
              </Field>
              <Field label="Channel">
                <ChannelSelect value={rule.channelId} onChange={v => updateRule(i, 'channelId', v)} />
              </Field>
            </div>
            <Field label="Mode">
              <Select value={rule.mode || 'toggle'} onChange={e => updateRule(i, 'mode', e.target.value)} className="w-full">
                <option value="toggle">Toggle (add on react, remove on unreact)</option>
                <option value="add">Add only (never remove)</option>
                <option value="remove">Remove only</option>
              </Select>
            </Field>
          </div>
        ))}
      </div>
      <button onClick={addRule}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border-bright text-text-muted hover:text-accent hover:border-accent/40 text-sm transition-all w-full justify-center">
        <Plus size={14} /> Add Rule
      </button>
    </Card>
  )
}

export default function ReactionRolesPage() {
  return (
    <ModulePanel title="Reaction Roles" description="Assign roles to members when they react to a message with a specific emoji." icon={Star} apiPath="reaction-roles">
      {({ data, setData }) => <ReactionRolesList data={data} setData={setData} />}
    </ModulePanel>
  )
}
