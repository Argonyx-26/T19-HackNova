import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Award, UserCheck, X, LogOut, Check, Key } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { user, switchUserRole, logout, showLoginModal, setShowLoginModal } = useAuth();

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050403]/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="relative w-full max-w-lg spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/95 via-[#0d0905]/90 to-[#060402]/98 border border-[#c9a15d]/40 shadow-[0_16px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden p-6">
        
        {/* Top Specular Rim */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f0d28f]/60 to-transparent" />

        {/* Close button */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_16px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[14px] flex items-center justify-center text-[#f0d28f]">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#fff6e4]">Authentication & Clearance Manager</h3>
            <p className="text-xs text-[#a3927a]">Switch role clearance or manage operator session.</p>
          </div>
        </div>

        {/* Current Active User Card */}
        {user && (
          <div className="mb-6 p-4 rounded-2xl bg-[#0b0805]/90 border border-[#c9a15d]/25 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-11 h-11 rounded-full border-2 border-[#c9a15d]/60 object-cover shadow-sm"
              />
              <div>
                <div className="text-sm font-semibold text-[#fff6e4] flex items-center gap-2">
                  {user.name}
                  <span className="text-[10px] font-mono uppercase bg-[#3a2814]/80 text-[#f0d28f] border border-[#c9a15d]/40 px-2.5 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-[#a3927a] font-mono mt-0.5">{user.email}</div>
                <div className="text-[11px] text-[#f0d28f] font-mono mt-0.5">{user.clearance}</div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setShowLoginModal(false);
              }}
              className="p-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {/* Switch Role Options */}
        <div className="space-y-3 mb-6">
          <label className="block text-[11px] font-mono text-[#f0d28f] uppercase tracking-wider font-bold">
            Select Clearance Role (1-Click Switch)
          </label>

          {/* Jury Evaluator */}
          <button
            onClick={() => {
              switchUserRole('jury');
              setShowLoginModal(false);
            }}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              user?.role === 'jury'
                ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                : 'bg-[#120d08] border-[#c9a15d]/20 hover:border-[#c9a15d]/40 text-[#a3927a]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-[#f0d28f]" />
              <div>
                <div className="text-xs font-semibold text-[#fff6e4]">Jury / Hackathon Evaluator</div>
                <div className="text-[11px] text-[#a3927a]">Streamlined Tour & Demo Privileges</div>
              </div>
            </div>
            {user?.role === 'jury' && <Check className="w-5 h-5 text-[#f0d28f]" />}
          </button>

          {/* Security Admin */}
          <button
            onClick={() => {
              switchUserRole('admin');
              setShowLoginModal(false);
            }}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              user?.role === 'admin'
                ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                : 'bg-[#120d08] border-[#c9a15d]/20 hover:border-[#c9a15d]/40 text-[#a3927a]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-[#f0d28f]" />
              <div>
                <div className="text-xs font-semibold text-[#fff6e4]">Security Admin (Tier-1 Alpha)</div>
                <div className="text-[11px] text-[#a3927a]">Full System Counterfactual & Simulation Override</div>
              </div>
            </div>
            {user?.role === 'admin' && <Check className="w-5 h-5 text-[#f0d28f]" />}
          </button>

          {/* Threat Analyst */}
          <button
            onClick={() => {
              switchUserRole('analyst');
              setShowLoginModal(false);
            }}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              user?.role === 'analyst'
                ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                : 'bg-[#120d08] border-[#c9a15d]/20 hover:border-[#c9a15d]/40 text-[#a3927a]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-[#f0d28f]" />
              <div>
                <div className="text-xs font-semibold text-[#fff6e4]">Senior Threat Intelligence Analyst</div>
                <div className="text-[11px] text-[#a3927a]">Graph Analysis & Behavioral Diagnostics</div>
              </div>
            </div>
            {user?.role === 'analyst' && <Check className="w-5 h-5 text-[#f0d28f]" />}
          </button>

        </div>

        <div className="pt-4 border-t border-[#c9a15d]/20 flex justify-end">
          <button
            onClick={() => setShowLoginModal(false)}
            className="px-4 py-2 bg-[#140e08] hover:bg-[#20160c] text-[#a3927a] hover:text-[#fff6e4] text-xs font-mono rounded-xl border border-[#c9a15d]/25 transition-colors cursor-pointer"
          >
            Close Manager
          </button>
        </div>

      </div>
    </div>
  );
};
