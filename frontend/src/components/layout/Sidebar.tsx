import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Layers, Info } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/situations', label: 'Situations', icon: Layers },
    { to: '/events', label: 'Live Events', icon: AlertTriangle },
  ];

  return (
    <aside className="w-56 bg-sentinel-surface border-r border-sentinel-border flex flex-col justify-between py-6">
      <div className="space-y-6">
        <div className="px-5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            NAVIGATION
          </span>
        </div>

        <nav className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-sentinel-card'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Operator Authority Info Box */}
      <div className="px-4">
        <div className="p-3 rounded-lg bg-sentinel-card border border-sentinel-border text-[11px] font-mono text-slate-400 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>OPERATOR ROLE</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Automated intelligence advises; authorized human operator retains final authority.
          </p>
        </div>
      </div>
    </aside>
  );
};
