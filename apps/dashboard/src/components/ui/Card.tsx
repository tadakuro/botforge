export function Card({ children, className = '' }) {
  return (
    <div className={`bg-bg-2 border border-border rounded-xl p-5 shadow-card ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-text-dim mb-1.5">{label}</label>}
      {children}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}

export function Input({ value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg bg-bg-1 border border-border text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm transition-all ${className}`}
    />
  )
}

export function Textarea({ value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 rounded-lg bg-bg-1 border border-border text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm transition-all resize-none ${className}`}
    />
  )
}

export function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`px-3 py-2 rounded-lg bg-bg-1 border border-border text-text focus:outline-none focus:border-accent text-sm transition-all ${className}`}
    >
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-lg bg-bg-1 border border-border">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ml-4 ${checked ? 'bg-accent shadow-glow-sm' : 'bg-bg-4'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export function NumberInput({ value, onChange, min, max, placeholder, className = '' }) {
  return (
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg bg-bg-1 border border-border text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm transition-all ${className}`}
    />
  )
}
