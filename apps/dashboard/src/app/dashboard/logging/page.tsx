'use client'

import ModulePanel from '@/components/modules/ModulePanel'
import { Card, CardHeader, Field, Toggle } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { ScrollText } from 'lucide-react'

const LOG_GROUPS = [
  { title: 'Messages', key: 'messages', events: [
    { key: 'messageDelete', label: 'Message Deleted' },
    { key: 'messageEdit', label: 'Message Edited' },
    { key: 'messageBulkDelete', label: 'Bulk Message Delete' },
  ]},
  { title: 'Members', key: 'members', events: [
    { key: 'memberJoin', label: 'Member Joined' },
    { key: 'memberLeave', label: 'Member Left' },
    { key: 'memberBan', label: 'Member Banned' },
    { key: 'memberUnban', label: 'Member Unbanned' },
    { key: 'memberNickChange', label: 'Nickname Changed' },
    { key: 'memberRoleChange', label: 'Roles Updated' },
  ]},
  { title: 'Voice', key: 'voice', events: [
    { key: 'voiceJoin', label: 'Voice Channel Join' },
    { key: 'voiceLeave', label: 'Voice Channel Leave' },
    { key: 'voiceMove', label: 'Voice Channel Move' },
  ]},
  { title: 'Server', key: 'server', events: [
    { key: 'roleCreate', label: 'Role Created' },
    { key: 'roleDelete', label: 'Role Deleted' },
    { key: 'channelCreate', label: 'Channel Created' },
    { key: 'channelDelete', label: 'Channel Deleted' },
  ]},
]

export default function LoggingPage() {
  return (
    <ModulePanel title="Logging" description="Track and log server events to designated channels." icon={ScrollText} apiPath="logging">
      {({ data, setData }) => (
        <>
          <Card>
            <CardHeader title="Default Log Channel" description="All enabled events log here unless overridden below." />
            <Field label="Channel">
              <ChannelSelect value={data.logChannel || ''} onChange={v => setData({ ...data, logChannel: v })} />
            </Field>
          </Card>
          {LOG_GROUPS.map(group => (
            <Card key={group.title}>
              <CardHeader title={`${group.title} Events`} />
              <div className="space-y-2 mb-4">
                {group.events.map(({ key, label }) => (
                  <Toggle key={key} checked={data[key] || false} onChange={v => setData({ ...data, [key]: v })} label={label} />
                ))}
              </div>
              <Field label={`${group.title} Log Channel Override`} hint="Leave empty to use default">
                <ChannelSelect
                  value={data[`${group.key}LogChannel`] || ''}
                  onChange={v => setData({ ...data, [`${group.key}LogChannel`]: v })}
                  placeholder="Use default log channel"
                />
              </Field>
            </Card>
          ))}
        </>
      )}
    </ModulePanel>
  )
}
