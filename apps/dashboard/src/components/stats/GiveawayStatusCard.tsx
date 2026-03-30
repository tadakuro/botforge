export default function GiveawayStatusCard({ active }) {
  return (
    <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-card">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Giveaways</p>
      <p className="text-3xl font-bold text-text tabular-nums">{active ?? 0}</p>
      <p className="text-xs text-text-muted mt-1">Active giveaways</p>
    </div>
  )
}
