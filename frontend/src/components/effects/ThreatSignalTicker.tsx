import React from 'react';

interface ThreatSignalTickerProps {
  className?: string;
}

export const ThreatSignalTicker: React.FC<ThreatSignalTickerProps> = ({
  className = ''
}) => {
  const tickerItems = [
    { time: '15:13:16', source: 'CCTV', text: 'Target person-104 enters Floor 4 Corridor', color: '#5b8def' },
    { time: '15:13:31', source: 'ACCESS', text: 'Badge reader #B-402 rejects keycard retry', color: '#26a88a' },
    { time: '15:13:44', source: 'NETWORK', text: '820 MB/s encrypted outbound spike (185.220.101.5)', color: '#e8b25c' },
    { time: '15:14:00', source: 'OSINT', text: 'IOC match: APT-29 Mimikatz hash signature', color: '#d9669f' },
    { time: '15:14:22', source: 'INCIDENT', text: 'SITUATION ESCALATION: F4 -> F5 Server Vault', color: '#c21f2b', isCritical: true },
    { time: '15:15:05', source: 'CCTV', text: 'Camera 04 detects unauthorized device deployment', color: '#5b8def' },
    { time: '15:15:40', source: 'IOT', text: 'Rack 02 vibration sensor anomaly + temperature rise', color: '#26a88a' },
    { time: '15:16:18', source: 'REASONING', text: 'VLM Corroboration: 4 multi-modal signals agree', color: '#f0d28f' }
  ];

  return (
    <div
      className={`w-full flex items-stretch border-y border-[#c9a15d]/20 font-mono text-[11px] uppercase tracking-wider bg-[#070503]/90 backdrop-blur-md overflow-hidden select-none z-20 ${className}`}
    >
      {/* Ticker Live Indicator Label */}
      <div className="flex-none flex items-center space-x-2 px-4 py-2 bg-[#0c0804] border-r border-[#c9a15d]/25 text-[#f0d28f] font-bold">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span className="truncate">LIVE OSINT &amp; SENSOR TELEMETRY</span>
      </div>

      {/* Marquee Animation Viewport */}
      <div
        className="overflow-hidden flex-1 flex items-center"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%)'
        }}
      >
        <div className="flex animate-[tick_45s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-2 px-5 py-2 ${
                item.isCritical ? 'text-rose-400 font-bold bg-rose-950/30' : 'text-[#a3927a]'
              }`}
            >
              <span className="text-[#fbf3e3]/70">{item.time}</span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
              />
              <span className="font-bold text-[#f0d28f]">{item.source}:</span>
              <span className={item.isCritical ? 'text-rose-300 font-semibold' : 'text-[#fbf3e3]'}>
                {item.text}
              </span>
              <span className="text-[#c9a15d]/30 pl-3">/</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
