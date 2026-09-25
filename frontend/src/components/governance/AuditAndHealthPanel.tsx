import React from 'react';
import type { AuditLogEntry, SystemMetricsData, SystemHealthData } from '../../types';
import { Activity, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface AuditAndHealthPanelProps {
  auditLogs: AuditLogEntry[];
  metrics: SystemMetricsData | null;
  health: SystemHealthData | null;
}

export const AuditAndHealthPanel: React.FC<AuditAndHealthPanelProps> = ({
  auditLogs,
  metrics,
  health
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* System Health & Telemetry (Left) */}
      <div className="lg:col-span-6 bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
              Operational Telemetry & Component Health
            </h3>
          </div>
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{health?.status || 'HEALTHY'}</span>
          </span>
        </div>

        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Throughput</div>
              <div className="text-base font-mono font-bold text-neutral-200">
                {metrics.events_per_second} <span className="text-xs text-neutral-500">EPS</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Correlation Latency</div>
              <div className="text-base font-mono font-bold text-cyan-300">
                {metrics.p95_correlation_latency_ms} <span className="text-xs text-neutral-500">ms</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">API Latency (p95)</div>
              <div className="text-base font-mono font-bold text-neutral-200">
                {metrics.p95_api_latency_ms} <span className="text-xs text-neutral-500">ms</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Active Situations</div>
              <div className="text-base font-mono font-bold text-amber-300">
                {metrics.active_situations_count}
              </div>
            </div>
          </div>
        )}

        {/* Source Feeds Status */}
        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Sensor & Ingestion Source Status
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {['CCTV', 'NETWORK', 'ACCESS', 'IOT'].map((src) => (
              <div key={src} className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800/80">
                <span className="font-mono text-neutral-300">{src}</span>
                <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ONLINE</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immutable Forensic Audit Trail (Right) */}
      <div className="lg:col-span-6 bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
              Immutable Forensic Audit Trail
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
            {auditLogs.length} Logged Actions
          </span>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No audit records generated in current observation cycle.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.audit_id}
                className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-neutral-200">{log.action}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                      {log.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-neutral-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="text-neutral-400 text-[11px] truncate">
                  Operator: <strong className="text-neutral-300">{log.operator_id}</strong> | Target: {log.target_type}:{log.target_id}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
