function App() {
  const states = [
    { name: 'NORMAL', bg: 'bg-state-normal-bg', border: 'border-state-normal-border', text: 'text-state-normal-text' },
    { name: 'ANOMALOUS', bg: 'bg-state-anomalous-bg', border: 'border-state-anomalous-border', text: 'text-state-anomalous-text' },
    { name: 'SUSPICIOUS', bg: 'bg-state-suspicious-bg', border: 'border-state-suspicious-border', text: 'text-state-suspicious-text' },
    { name: 'ESCALATING', bg: 'bg-state-escalating-bg', border: 'border-state-escalating-border', text: 'text-state-escalating-text' },
    { name: 'CRITICAL', bg: 'bg-state-critical-bg', border: 'border-state-critical-border', text: 'text-state-critical-text' },
    { name: 'CONTAINED', bg: 'bg-state-contained-bg', border: 'border-state-contained-border', text: 'text-state-contained-text' },
  ]

  const sources = [
    { label: 'CCTV', color: 'text-source-cctv border-source-cctv/30 bg-source-cctv/10' },
    { label: 'NETWORK', color: 'text-source-network border-source-network/30 bg-source-network/10' },
    { label: 'ACCESS', color: 'text-source-access border-source-access/30 bg-source-access/10' },
    { label: 'IOT', color: 'text-source-iot border-source-iot/30 bg-source-iot/10' },
  ]

  return (
    <div className="min-h-screen bg-sentinel-bg text-slate-100 p-8">
      <header className="border-b border-sentinel-border pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-bold tracking-wider uppercase font-mono text-white">SENTINEL-X</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Intelligent Threat Detection & Situational Awareness System</p>
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest border border-sentinel-border px-3 py-1.5 rounded bg-sentinel-surface">
          Design System Baseline
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Situation State Matrix</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {states.map((s) => (
            <div key={s.name} className={`p-4 rounded-lg border ${s.bg} ${s.border} text-center`}>
              <div className={`text-xs font-mono font-bold tracking-wider ${s.text}`}>{s.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Event Stream Source Badges</h2>
        <div className="flex flex-wrap gap-3">
          {sources.map((src) => (
            <span key={src.label} className={`px-3 py-1 text-xs font-mono font-medium rounded border ${src.color}`}>
              ● {src.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
