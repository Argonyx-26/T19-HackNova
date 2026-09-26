import React from 'react';
import {
  LayoutDashboard,
  Video,
  Share2,
  Sliders,
  Info,
  Terminal,
  Award,
  UserCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type MainNavSection =
  | 'overview'
  | 'cyber_physical'
  | 'graph'
  | 'simulation'
  | 'situations';

interface SidebarProps {
  activeSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  devMode: boolean;
  onToggleDevMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  devMode,
  onToggleDevMode
}) => {
  const { user, setShowLoginModal } = useAuth();

  const navItems: { id: MainNavSection; label: string; description: string; badge?: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Situation Intelligence', description: '5-Stage Operational Journey', badge: 'CORE', icon: LayoutDashboard },
    { id: 'cyber_physical', label: 'Vision & CTI Fusion', description: '5-Camera Wall & Threat DNA', icon: Video },
    { id: 'graph', label: '3D Twin & Graph', description: 'Spatiotemporal Topology', icon: Share2 },
    { id: 'simulation', label: 'Sandbox & What-If', description: 'Counterfactual Simulator', icon: Sliders }
  ];

  return (
    <aside className="w-64 bg-obsidian-950 border-r border-gold/15 flex flex-col justify-between py-4 select-none flex-shrink-0">
      <div className="space-y-4">
        <div className="px-4 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">
            INTELLIGENCE CONSOLE
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-gold-deep/20 text-gold-hot border border-gold/40 font-bold">
            2.0
          </span>
        </div>

        <nav className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-start space-x-3 p-3 rounded-2xl text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-deep/25 via-gold/10 to-transparent text-paper border border-gold/40 shadow-lg shadow-gold/5'
                    : 'text-muted hover:text-paper hover:bg-obsidian-900/70 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive ? 'bg-gold-deep/30 text-gold-hot border border-gold/50 shadow-sm' : 'bg-obsidian-900 text-muted group-hover:text-paper group-hover:border-gold/20 border border-transparent'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-sans leading-tight ${isActive ? 'text-gold-hot' : 'text-paper'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-gold-deep/40 text-gold-hot border border-gold/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-muted truncate mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Diagnostics & Operator Profile Notice */}
      <div className="px-3 space-y-2.5">
        {/* User / Jury Role Badge */}
        {user && (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full p-2.5 rounded-2xl bg-obsidian-900/80 border border-gold/20 hover:border-gold/40 transition text-left group"
          >
            <div className="flex items-center space-x-2.5">
              {user.role === 'jury' ? (
                <Award className="w-4 h-4 text-gold-hot shrink-0" />
              ) : user.role === 'admin' ? (
                <Shield className="w-4 h-4 text-gold shrink-0" />
              ) : (
                <UserCheck className="w-4 h-4 text-muted shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold font-sans text-paper truncate">{user.name}</div>
                <div className="text-[9px] font-mono text-gold-hot truncate">{user.clearance}</div>
              </div>
            </div>
          </button>
        )}

        {/* Dev Diagnostics Toggle */}
        <button
          onClick={onToggleDevMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-mono transition-colors ${
            devMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-obsidian-900/60 border-gold/15 text-muted hover:text-paper hover:border-gold/30'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEV METRICS</span>
          </div>
          <span className="text-[9px] uppercase font-bold">{devMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Operator Role Card */}
        <div className="p-3 rounded-2xl bg-obsidian-900/50 border border-gold/15 text-[10px] font-mono text-muted space-y-1">
          <div className="flex items-center space-x-1.5 text-gold-hot font-semibold">
            <Info className="w-3.5 h-3.5 text-gold" />
            <span>HUMAN IN THE LOOP</span>
          </div>
          <p className="text-[10px] leading-snug text-muted font-sans">
            AI correlates & forecasts. Authorized human retains final executive authority.
          </p>
        </div>
      </div>
    </aside>
  );
};
