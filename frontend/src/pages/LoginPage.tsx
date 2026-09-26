import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Shield, UserCheck, Key, ArrowRight, Award, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [selectedRole] = useState<UserRole>('jury');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLogin = (role: UserRole) => {
    setIsSubmitting(true);
    setTimeout(() => {
      login(role);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(selectedRole, email ? email.split('@')[0] : undefined, email || undefined);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050403] text-[#d5c7b3] overflow-hidden font-sans select-none px-4 py-8">
      {/* Dynamic Animated Cyber Grid & Glowing Orbs Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a2814]/30 via-[#0a0704] to-[#040302]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a15d]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-[#f0d28f]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#c9a15d08_1px,transparent_1px),linear-gradient(to_bottom,#c9a15d08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 spotlight-card bg-gradient-to-b from-[#140e08]/95 via-[#0d0905]/90 to-[#060402]/98 border border-[#c9a15d]/35 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-3xl overflow-hidden">
        
        {/* Left Panel - Brand & Jury Tour Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#120d08] via-[#0b0805] to-[#140e08] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#c9a15d]/20 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#c9a15d]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            {/* Logo Badge */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_18px_rgba(201,161,93,0.35)]">
                <div className="w-full h-full bg-[#0d0905] rounded-[14px] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#f0d28f] animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-[#fff6e4] flex items-center gap-1.5 font-mono">
                  SENTINEL<span className="text-[#f0d28f] font-extrabold">-X</span>
                </h1>
                <p className="text-[11px] text-[#a3927a] font-mono tracking-wider uppercase">Situational Intelligence</p>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-xl font-semibold text-[#fff6e4] leading-snug mb-3 font-serif">
              Next-Gen Threat Detection & Counterfactual Sandbox
            </h2>
            <p className="text-xs text-[#a3927a] leading-relaxed mb-6">
              Transforming fragmented CCTV, Access, Network IDS & IoT alerts into correlated topological situation graphs with future trajectory forecasting.
            </p>

            {/* Key Innovations List */}
            <div className="space-y-3 font-sans">
              <div className="flex items-start space-x-2.5 text-xs text-[#d5c7b3]">
                <CheckCircle2 className="w-4 h-4 text-[#f0d28f] shrink-0 mt-0.5" />
                <span>Deterministic Contextual Correlation Engine</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-[#d5c7b3]">
                <CheckCircle2 className="w-4 h-4 text-[#f0d28f] shrink-0 mt-0.5" />
                <span>Real-Time NetworkX Situation Topology & 3D Twin</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-[#d5c7b3]">
                <CheckCircle2 className="w-4 h-4 text-[#f0d28f] shrink-0 mt-0.5" />
                <span>Counterfactual Sandbox (MONITOR, ISOLATE, LOCKDOWN)</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-[#d5c7b3]">
                <CheckCircle2 className="w-4 h-4 text-[#f0d28f] shrink-0 mt-0.5" />
                <span>Immutable Hash-Chained Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Quick Jury Notice */}
          <div className="mt-8 pt-4 border-t border-[#c9a15d]/20">
            <div className="flex items-center space-x-2 text-[11px] text-[#f0d28f] bg-[#2a1d0f]/80 border border-[#c9a15d]/35 rounded-xl p-3 shadow-inner">
              <Award className="w-4 h-4 text-[#f0d28f] shrink-0" />
              <span>Jury Evaluation Mode enables instant 1-click access without password complexity.</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Options */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-[#080503]/80">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#fff6e4] flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#f0d28f]" /> Security Access Authentication
                </h3>
                <p className="text-xs text-[#a3927a] mt-0.5">Select a clearance role or sign in with your credentials.</p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#3a2814]/80 border border-[#c9a15d]/40 text-[#f0d28f] px-2.5 py-1 rounded-full">
                SECURE TIER-1
              </span>
            </div>

            {/* 1-Click Role Presets Cards */}
            <div className="mb-6">
              <label className="block text-[11px] font-mono text-[#f0d28f] uppercase tracking-wider mb-2.5 font-bold">
                Instant 1-Click Access Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Jury Evaluator Option */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('jury')}
                  disabled={isSubmitting}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group relative cursor-pointer ${
                    selectedRole === 'jury'
                      ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                      : 'bg-[#120d08] border-[#c9a15d]/20 text-[#a3927a] hover:border-[#c9a15d]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Award className="w-4 h-4 text-[#f0d28f] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-[#3a2814] text-[#f0d28f] border border-[#c9a15d]/40">
                      BEST
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#fff6e4]">Jury Evaluator</div>
                  <div className="text-[10px] text-[#a3927a] mt-0.5">Instant Hackathon Tour</div>
                </button>

                {/* Admin Option */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isSubmitting}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group relative cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                      : 'bg-[#120d08] border-[#c9a15d]/20 text-[#a3927a] hover:border-[#c9a15d]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Shield className="w-4 h-4 text-[#f0d28f] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-[#3a2814] text-[#f0d28f] border border-[#c9a15d]/40">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#fff6e4]">Security Admin</div>
                  <div className="text-[10px] text-[#a3927a] mt-0.5">Full System Override</div>
                </button>

                {/* Analyst Option */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('analyst')}
                  disabled={isSubmitting}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group relative cursor-pointer ${
                    selectedRole === 'analyst'
                      ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                      : 'bg-[#120d08] border-[#c9a15d]/20 text-[#a3927a] hover:border-[#c9a15d]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <UserCheck className="w-4 h-4 text-[#f0d28f] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-[#3a2814] text-[#f0d28f] border border-[#c9a15d]/40">
                      INTEL
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#fff6e4]">Threat Analyst</div>
                  <div className="text-[10px] text-[#a3927a] mt-0.5">Graph & Intel View</div>
                </button>

              </div>
            </div>

            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#c9a15d]/20" /></div>
              <span className="relative px-3 bg-[#0d0905] text-[10px] font-mono text-[#a3927a] uppercase tracking-widest">
                Or Sign In With Account
              </span>
            </div>

            {/* Custom Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-[#a3927a] mb-1">
                  Operator Identifier / Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="operator@sentinelx.sec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0e0a06] border border-[#c9a15d]/30 rounded-2xl px-4 py-2.5 text-xs text-[#fff6e4] placeholder-[#7a6a55] focus:outline-none focus:border-[#f0d28f] focus:ring-1 focus:ring-[#f0d28f] transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a3927a] mb-1">
                  Security Token / Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0e0a06] border border-[#c9a15d]/30 rounded-2xl px-4 py-2.5 text-xs text-[#fff6e4] placeholder-[#7a6a55] focus:outline-none focus:border-[#f0d28f] focus:ring-1 focus:ring-[#f0d28f] transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] hover:from-[#d8b06c] hover:to-[#ffdf9e] text-[#050403] font-mono font-bold text-xs py-3 px-4 rounded-2xl shadow-[0_0_20px_rgba(201,161,93,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center justify-center space-x-2 transition-all group disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#050403]/40 border-t-[#050403] rounded-full animate-spin" />
                    Authenticating Security Token...
                  </span>
                ) : (
                  <>
                    <span>Enter Sentinel-X Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-3 border-t border-[#c9a15d]/15 flex items-center justify-between text-[11px] text-[#7a6a55] font-mono">
            <span>SENTINEL-X v2.4.0</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#a3927a]">Auth Node Active</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
