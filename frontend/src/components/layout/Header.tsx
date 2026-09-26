import React from 'react';
import { Radio, Menu, X, Sparkles } from 'lucide-react';
import type { SituationState, MainNavSection } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SentinelLogo } from '../brand/SentinelLogo';

interface HeaderProps {
  systemStatus?: string;
  activeState: SituationState;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  systemMode?: 'LIVE' | 'SIMULATION' | 'REPLAY';
  onSpeedChange?: (speed: number) => void;
  onResetScenario?: () => void;
  onOpenJuryTour?: () => void;
  onOpenStoryExperience?: () => void;
  siteProfile?: string;
  onSiteProfileChange?: (profile: string) => void;
  activeSection?: MainNavSection;
  onSelectSection?: (section: MainNavSection) => void;
  devMode?: boolean;
  onToggleDevMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeState,
  onOpenStoryExperience,
  activeSection = 'overview',
  onSelectSection,
}) => {
  const { user, setShowLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);

  const getStateBadge = (state: SituationState) => {
    switch (state) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.35)]';
      case 'ESCALATING':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'SUSPICIOUS':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-500/60';
      case 'ANOMALOUS':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/60';
      case 'CONTAINED':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
    }
  };

  const navLinks: { id: MainNavSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'situations', label: 'Situations' },
    { id: 'cyber_physical', label: 'Evidence' },
    { id: 'graph', label: 'Reasoning' },
    { id: 'simulation', label: 'Simulation' }
  ];

  return (
    <header className="h-16 px-4 md:px-8 w-full max-w-[1440px] mx-auto flex items-center justify-between sticky top-0 z-40 select-none bg-[#050403]/90 backdrop-blur-3xl border-b border-[#c9a15d]/20 transition-all duration-300">
      {/* Top Glass Specular Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#f0d28f]/25 to-transparent pointer-events-none" />

      {/* Left: Brand Wordmark */}
      <div className="flex items-center space-x-3 shrink-0">
        <SentinelLogo
          variant="header"
          activeState={activeState}
          showOrbits={false}
          showWordmark={true}
          onClick={() => onSelectSection && onSelectSection('overview')}
        />
      </div>

      {/* Center: Clean 5-Stage Core Navigation */}
      <nav className="hidden md:flex items-center space-x-1.5 bg-[#120c06]/85 p-1 rounded-full border border-[#c9a15d]/20 backdrop-blur-2xl shadow-inner">
        {navLinks.map((link) => {
          const isActive = activeSection === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onSelectSection && onSelectSection(link.id)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-[#4d351a] via-[#312010] to-[#1a1107] text-[#fff6e4] border border-[#f0d28f]/60 shadow-[0_0_12px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5 border border-transparent'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right: State Pill, Story Mode, and Operator Profile */}
      <div className="flex items-center space-x-2.5 shrink-0">
        {onOpenStoryExperience && (
          <button
            onClick={onOpenStoryExperience}
            title="Launch Story Mode"
            className="hidden sm:flex px-3 py-1.5 rounded-full bg-[#1c140c] hover:bg-[#2a1d0f] border border-[#c9a15d]/40 text-[#f0d28f] text-xs font-mono font-bold items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f0d28f]" />
            <span>Story Mode</span>
          </button>
        )}

        {/* State Pill */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border flex items-center space-x-1.5 backdrop-blur-xl ${getStateBadge(
            activeState
          )}`}
        >
          <Radio className="w-3 h-3 animate-pulse text-current" />
          <span>{activeState}</span>
        </div>

        {/* Operator Profile */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-full bg-[#140e08]/90 border border-[#c9a15d]/30 text-xs font-mono text-[#fff6e4] hover:border-[#f0d28f]/60 transition cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7a4f1c] to-[#f0d28f] flex items-center justify-center text-[9px] font-bold text-[#050403]">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
          </div>
          <span className="hidden lg:inline text-xs font-bold text-[#fbf3e3]">
            {user?.name || 'OPERATOR'}
          </span>
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 rounded-full bg-[#140e08] text-[#f0d28f] border border-[#c9a15d]/30"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0c0805]/98 backdrop-blur-3xl border-b border-[#c9a15d]/30 shadow-2xl p-4 space-y-2 z-50 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  if (onSelectSection) onSelectSection(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center justify-between ${
                  isActive
                    ? 'bg-[#3a2814] text-[#fff6e4] border border-[#f0d28f]/50'
                    : 'text-[#a3927a] hover:bg-[#1a120a] hover:text-[#fff6e4]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#f0d28f]" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
