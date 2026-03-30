'use client'

import { useState } from 'react'
import ModulePanel from '@/components/modules/ModulePanel'
import { Card, CardHeader, Field, Input, Select } from '@/components/ui/Card'
import { UserPlus, Plus, Trash2 } from 'lucide-react'

function AutoRolesList({ data, setData }) {
  const roles = data.roles || []

  function addRole() {
    setData({ ...data, roles: [...roles, { roleId: '', type: 'all', delay: 0 }] })
  }

  function updateRole(i, field, value) {
    setData({ ...data, roles: roles.map((r, idx) => idx === i ? { ...r, [field]: value } : r) })
  }

  function removeRole(i) {
    setData({ ...data, roles: roles.filter((_, idx) => idx !== i) })
  }

  return (
    <Card>
      <CardHeader title="Auto-assigned Roles" description="Roles assigned automatically when a member joins." />
      <div className="space-y-3 mb-3">
        {roles.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">No auto roles configured. Add one below.</p>
        )}
        {roles.map((role, i) => (
          <div key={i} className="flex items-end gap-3 p-3 bg-bg-1 rounded-lg border border-border">
            <Field label="Role ID" className="flex-1">
              <Input
                placeholder="Role ID"
                value={role.roleId}
                onChange={(e) => updateRole(i, 'roleId', e.target.value)}
              />
            </Field>
            <Field label="Assign To">
              <Select
                value={role.type}
                onChange={(e) => updateRole(i, 'type', e.target.value)}
              >
                <option value="all">All members</option>
                <option value="humans">Humans only</option>
                <option value="bots">Bots only</option>
              </Select>
            </Field>
            <Field label="Delay (sec)">
              <Input
                type="number"
                placeholder="0"
                value={role.delay || ''}
                onChange={(e) => updateRole(i, 'delay', parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </Field>
            <button
              onClick={() => removeRole(i)}
              className="mb-0.5 p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addRole}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border-bright text-text-muted hover:text-accent hover:border-accent/40 text-sm transition-all w-full justify-center"
      >
        <Plus size={14} />
        Add Role
      </button>
    </Card>
  )
}

export default function AutoRolesPage() {
  return (
    <ModulePanel
      title="Auto Roles"
      description="Automatically assign roles when a member joins your server."
      icon={UserPlus}
      apiPath="auto-roles"
    >
      {({ data, setData }) => <AutoRolesList data={data} setData={setData} />}
    </ModulePanel>
  )
}
