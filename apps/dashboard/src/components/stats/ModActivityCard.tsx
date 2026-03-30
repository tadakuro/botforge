export default function ModActivityCard({ modCount, automodCount }) {
  return (
    <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-card">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Moderation</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-text tabular-nums">{modCount ?? 0}</p>
          <p className="text-xs text-text-muted mt-1">Mod actions</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-text tabular-nums">{automodCount ?? 0}</p>
          <p className="text-xs text-text-muted mt-1">Automod hits</p>
        </div>
      </div>
    </div>
  )
}
