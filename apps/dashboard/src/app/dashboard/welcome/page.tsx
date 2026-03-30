'use client'

import ModulePanel from '@/components/modules/ModulePanel'
import { Card, CardHeader, Field, Input, Textarea, Toggle } from '@/components/ui/Card'
import ChannelSelect from '@/components/ui/ChannelSelect'
import { MessageSquare } from 'lucide-react'

function WelcomePreview({ embed, username = 'NewMember', memberCount = 42 }) {
  if (!embed?.title && !embed?.description) return null
  const color = embed.color || '#5865f2'
  const avatarUrl = `https://cdn.discordapp.com/embed/avatars/0.png`

  return (
    <Card>
      <CardHeader title="Preview" description="Approximate preview of how the welcome embed will look." />
      <div className="bg-[#313338] rounded-xl p-4 font-sans">
        <div className="flex items-start gap-3">
          <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">BotForge</span>
              <span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.5 rounded font-semibold">BOT</span>
            </div>
            <div className="rounded-lg overflow-hidden border-l-4 bg-[#2b2d31]" style={{ borderColor: color }}>
              {embed.bannerUrl && <img src={embed.bannerUrl} alt="" className="w-full h-24 object-cover" onError={e => e.target.style.display='none'} />}
              <div className="p-4">
                {embed.authorName && <p className="text-xs text-[#b5bac1] mb-2">{embed.authorName.replace('{username}', username).replace('{server}', 'My Server')}</p>}
                {embed.title && <p className="text-base font-bold text-white mb-1">{embed.title.replace('{username}', username).replace('{memberCount}', memberCount).replace('{server}', 'My Server')}</p>}
                {embed.description && <p className="text-sm text-[#dbdee1] whitespace-pre-wrap">{embed.description.replace('{username}', username).replace('{memberCount}', memberCount).replace('{server}', 'My Server').replace('{accountAge}', '2 years').replace('{joinDate}', new Date().toLocaleDateString())}</p>}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {embed.showMemberCount && <div className="bg-[#1e1f22] rounded p-2"><p className="text-[10px] text-[#b5bac1] uppercase font-semibold">Member Count</p><p className="text-sm text-white font-bold">#{memberCount}</p></div>}
                  {embed.showAccountAge && <div className="bg-[#1e1f22] rounded p-2"><p className="text-[10px] text-[#b5bac1] uppercase font-semibold">Account Age</p><p className="text-sm text-white font-bold">2 years</p></div>}
                </div>
                {embed.footer && <p className="text-xs text-[#b5bac1] mt-3 pt-2 border-t border-[#3f4147]">{embed.footer.replace('{server}', 'My Server').replace('{memberCount}', memberCount)}</p>}
              </div>
              {embed.showAvatar && <div className="px-4 pb-4 flex justify-end"><img src={avatarUrl} alt="" className="w-16 h-16 rounded-full border-4 border-[#2b2d31]" /></div>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function WelcomePage() {
  return (
    <ModulePanel title="Welcome & Goodbye" description="Send rich embed welcome cards with user avatars, banners, member count and more." icon={MessageSquare} apiPath="welcome">
      {({ data, setData }) => {
        const embed = data.welcomeEmbed || {}
        function updateEmbed(field, value) {
          setData({ ...data, welcomeEmbed: { ...embed, [field]: value } })
        }
        return (
          <>
            <Card>
              <CardHeader title="Welcome Channel" />
              <Field label="Channel">
                <ChannelSelect value={data.welcomeChannel || ''} onChange={v => setData({ ...data, welcomeChannel: v })} />
              </Field>
            </Card>
            <Card>
              <CardHeader title="Welcome Embed" description="Build a rich embed card shown when a member joins." />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Accent Color">
                    <div className="flex items-center gap-2">
                      <input type="color" value={embed.color || '#5865f2'} onChange={e => updateEmbed('color', e.target.value)} className="w-10 h-9 rounded-lg border border-border bg-bg-1 cursor-pointer p-0.5 flex-shrink-0" />
                      <Input placeholder="#5865f2" value={embed.color || ''} onChange={e => updateEmbed('color', e.target.value)} />
                    </div>
                  </Field>
                  <Field label="Banner Image URL">
                    <Input placeholder="https://..." value={embed.bannerUrl || ''} onChange={e => updateEmbed('bannerUrl', e.target.value)} />
                  </Field>
                </div>
                <Field label="Author Line" hint="Variables: {username}, {server}">
                  <Input placeholder="Welcome to {server}!" value={embed.authorName || ''} onChange={e => updateEmbed('authorName', e.target.value)} />
                </Field>
                <Field label="Title" hint="Variables: {username}, {server}, {memberCount}">
                  <Input placeholder="Hey {username}, welcome! 👋" value={embed.title || ''} onChange={e => updateEmbed('title', e.target.value)} />
                </Field>
                <Field label="Description" hint="Variables: {username}, {server}, {memberCount}, {accountAge}, {joinDate}">
                  <Textarea placeholder={"You are member #{memberCount}!\nAccount created {accountAge} ago."} value={embed.description || ''} onChange={e => updateEmbed('description', e.target.value)} rows={4} />
                </Field>
                <Field label="Footer" hint="Variables: {server}, {memberCount}">
                  <Input placeholder="{server} · {memberCount} members" value={embed.footer || ''} onChange={e => updateEmbed('footer', e.target.value)} />
                </Field>
              </div>
            </Card>
            <Card>
              <CardHeader title="Embed Features" />
              <div className="space-y-2">
                <Toggle checked={embed.showAvatar || false} onChange={v => updateEmbed('showAvatar', v)} label="Show User Avatar" description="Display the joining member's Discord avatar" />
                <Toggle checked={embed.showMemberCount || false} onChange={v => updateEmbed('showMemberCount', v)} label="Show Member Count" description="Show what number member they are" />
                <Toggle checked={embed.showAccountAge || false} onChange={v => updateEmbed('showAccountAge', v)} label="Show Account Age" description="Show how old their Discord account is" />
                <Toggle checked={embed.showJoinDate || false} onChange={v => updateEmbed('showJoinDate', v)} label="Show Join Date" description="Show the exact date they joined" />
                <Toggle checked={data.welcomeDM || false} onChange={v => setData({ ...data, welcomeDM: v })} label="Also DM the User" description="Send a copy of the welcome message to their DMs" />
              </div>
            </Card>
            <WelcomePreview embed={embed} />
            <Card>
              <CardHeader title="Goodbye Message" />
              <div className="space-y-3">
                <Field label="Channel">
                  <ChannelSelect value={data.goodbyeChannel || ''} onChange={v => setData({ ...data, goodbyeChannel: v })} />
                </Field>
                <Field label="Message" hint="Variables: {username}, {server}">
                  <Textarea placeholder="Goodbye {username}, we'll miss you!" value={data.goodbyeMessage || ''} onChange={e => setData({ ...data, goodbyeMessage: e.target.value })} rows={2} />
                </Field>
              </div>
            </Card>
          </>
        )
      }}
    </ModulePanel>
  )
}
