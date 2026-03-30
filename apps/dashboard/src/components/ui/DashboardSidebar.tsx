'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Shield, Bot, MessageSquare, Star,
  ScrollText, UserPlus, Terminal, Layers, Gift,
  LogOut, BarChart2, Clock, ChevronRight, Webhook, Menu, X,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { label: 'Moderation', href: '/dashboard/moderation', icon: Shield, moduleKey: 'moderation' },
      { label: 'Auto Mod', href: '/dashboard/automod', icon: Bot, moduleKey: 'automod' },
      { label: 'Logging', href: '/dashboard/logging', icon: ScrollText, moduleKey: 'logging' },
    ],
  },
  {
    label: 'Members',
    items: [
      { label: 'Welcome', href: '/dashboard/welcome', icon: MessageSquare, moduleKey: 'welcome' },
      { label: 'Auto Roles', href: '/dashboard/auto-roles', icon: UserPlus, moduleKey: 'auto-roles' },
      { label: 'Reaction Roles', href: '/dashboard/reaction-roles', icon: Star, moduleKey: 'reaction-roles' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Commands', href: '/dashboard/commands', icon: Terminal },
      { label: 'Embeds', href: '/dashboard/embeds', icon: Layers, moduleKey: 'embeds' },
      { label: 'Polls', href: '/dashboard/polls', icon: BarChart2, moduleKey: 'polls' },
      { label: 'Giveaways', href: '/dashboard/giveaways', icon: Gift },
      { label: 'Scheduled', href: '/dashboard/scheduled-messages', icon: Clock, moduleKey: 'scheduled-messages' },
      { label: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
    ],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [moduleStates, setModuleStates] = useState({})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const keys = NAV_SECTIONS.flatMap(s => s.items).map(i => i.moduleKey).filter(Boolean)
    Promise.all(
      keys.map(k => fetch(`/api/bot/${k}`).then(r => r.json()).catch(() => ({ enabled: false })))
    ).then(results => {
      const states = {}
      keys.forEach((k, i) => { states[k] = results[i]?.enabled || false })
      setModuleStates(states)
    })
  }, [pathname])

  useEffect(() => { setOpen(false) }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.022.015.043.031.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text leading-none">BotForge</p>
            <p className="text-[10px] text-text-muted mt-0.5">Dashboard</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-text-muted hover:text-text transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Nav — flex-1 so it fills space and scrolls internally */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-2 min-h-0">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-2 mb-0.5 mt-1">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(({ label, href, icon: Icon, moduleKey }) => {
                const active = pathname === href
                const enabled = moduleKey ? moduleStates[moduleKey] : null
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all relative ${
                      active
                        ? 'bg-accent-muted text-accent border border-accent/20'
                        : 'text-text-muted hover:text-text hover:bg-bg-3'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />}
                    <Icon size={15} className={active ? 'text-accent' : ''} />
                    <span className="flex-1 font-medium">{label}</span>
                    {enabled !== null && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${enabled ? 'bg-success animate-pulse-dot' : 'bg-border-bright'}`} />
                    )}
                    {active && <ChevronRight size={12} className="text-accent opacity-60" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — pinned to bottom, never pushed away */}
      <div className="flex-shrink-0 p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger/10 transition-all w-full"
        >
          <LogOut size={15} />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-bg-1 border-b border-border flex items-center px-4 z-20">
        <button onClick={() => setOpen(true)} className="p-2 text-text-muted hover:text-text transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.022.015.043.031.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-text">BotForge</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-60 bg-bg-1 border-r border-border flex flex-col z-40
        transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  )
}
