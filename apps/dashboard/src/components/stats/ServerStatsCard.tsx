export default function ServerStatsCard({ guilds, totalMembers }) {
  return (
    <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-card">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Servers</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-text tabular-nums">{guilds ?? '—'}</p>
          <p className="text-xs text-text-muted mt-1">Servers</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-text tabular-nums">{totalMembers ?? '—'}</p>
          <p className="text-xs text-text-muted mt-1">Members</p>
        </div>
      </div>
    </div>
  )
}
