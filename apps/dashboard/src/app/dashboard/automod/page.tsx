'use client'

import ModulePanel from '@/components/modules/ModulePanel'
import { Card, CardHeader, Field, Input, Toggle, Select, Textarea } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { Bot } from 'lucide-react'

export default function AutoModPage() {
  return (
    <ModulePanel title="Auto Mod" description="Automatically detect and act on spam, bad words, invite links, mass mentions, and more." icon={Bot} apiPath="automod">
      {({ data, setData }) => (
        <>
          <Card>
            <CardHeader title="Detection Rules" />
            <div className="space-y-2">
              {[
                { key: 'filterSpam', label: 'Anti-Spam', desc: 'Flag users sending 5+ messages within 5 seconds' },
                { key: 'filterLinks', label: 'Block Links', desc: 'Remove messages containing HTTP/HTTPS URLs' },
                { key: 'filterInvites', label: 'Block Invites', desc: 'Remove Discord server invite links' },
                { key: 'filterMentions', label: 'Mass Mentions', desc: 'Remove messages with 5 or more user mentions' },
                { key: 'filterCaps', label: 'Excessive Caps', desc: 'Flag messages with more than 70% uppercase' },
                { key: 'filterEmoji', label: 'Emoji Spam', desc: 'Flag messages with excessive emoji usage' },
              ].map(({ key, label, desc }) => (
                <Toggle key={key} checked={data[key] || false} onChange={v => setData({ ...data, [key]: v })} label={label} description={desc} />
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Banned Words" />
            <Field label="Word List" hint="Comma-separated. Partial matches included.">
              <Textarea placeholder="word1, word2, word3" value={data.bannedWords || ''} onChange={e => setData({ ...data, bannedWords: e.target.value })} rows={3} />
            </Field>
          </Card>
          <Card>
            <CardHeader title="Action on Trigger" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Action">
                <Select value={data.action || 'delete'} onChange={e => setData({ ...data, action: e.target.value })} className="w-full">
                  <option value="delete">Delete message only</option>
                  <option value="warn">Delete + warn user</option>
                  <option value="timeout">Delete + timeout (5 min)</option>
                  <option value="kick">Delete + kick user</option>
                </Select>
              </Field>
              <Field label="Log Channel Override" hint="Leave empty to use mod log channel">
                <ChannelSelect value={data.logChannel || ''} onChange={v => setData({ ...data, logChannel: v })} placeholder="Use default log channel" />
              </Field>
            </div>
          </Card>
          <Card>
            <CardHeader title="Exemptions" />
            <div className="space-y-3">
              <Field label="Exempt Role IDs" hint="Comma-separated">
                <Input placeholder="e.g. 111111111, 222222222" value={data.exemptRoles || ''} onChange={e => setData({ ...data, exemptRoles: e.target.value })} />
              </Field>
              <Field label="Exempt Channel">
                <ChannelSelect value={data.exemptChannels || ''} onChange={v => setData({ ...data, exemptChannels: v })} placeholder="No exempt channel" />
              </Field>
            </div>
          </Card>
        </>
      )}
    </ModulePanel>
  )
}
