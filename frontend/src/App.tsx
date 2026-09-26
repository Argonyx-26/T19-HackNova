import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { JuryTourModal } from './components/jury/JuryTourModal';
import { Header } from './components/layout/Header';
import { SentinelPreloader } from './components/brand/SentinelPreloader';
import { CinematicIntelligenceBackground } from './components/background/CinematicIntelligenceBackground';
import { SentinelCinematicExperience } from './components/experience/SentinelCinematicExperience';
import { Dashboard } from './pages/Dashboard';
import { EventsPage } from './pages/Events';
import { SituationsPage } from './pages/Situations';
import type { SituationState, MainNavSection, Situation, InterventionAction } from './types';
import { api } from './services/api';

function AppContent() {
  const [activeState, setActiveState] = useState<SituationState>('CRITICAL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<MainNavSection>('overview');
  const [devMode, setDevMode] = useState<boolean>(false);
  const [isJuryTourOpen, setIsJuryTourOpen] = useState<boolean>(false);
  const [siteProfile, setSiteProfile] = useState<string>('campus');
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [appExperienceMode, setAppExperienceMode] = useState<'STORY' | 'COMMAND_CENTER'>('STORY');
  const [currentSituation, setCurrentSituation] = useState<Situation | null>(null);

  // Poll current situation telemetry
  useEffect(() => {
    const fetchSituation = async () => {
      try {
        const sits = await api.getSituations();
        const active = sits.find((s) => s.status === 'CRITICAL' || s.status === 'ESCALATING') || sits[0] || null;
        setCurrentSituation(active);
        if (active?.status) {
          setActiveState(active.status);
        }
      } catch (e) {
        console.error('Failed to fetch initial situation in AppContent:', e);
      }
    };
    fetchSituation();
  }, [refreshTrigger]);

  const handleToggleSimulation = async () => {
    try {
      if (isSimulating) {
        await api.stopSimulation();
        setIsSimulating(false);
      } else {
        await api.startSimulation('escalation_alpha', 1.0);
        setIsSimulating(true);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Simulation toggle error:', err);
    }
  };

  const handleStartBreachScenario = async () => {
    try {
      await api.startSimulation('escalation_alpha', 1.0);
      setIsSimulating(true);
      setRefreshTrigger((prev) => prev + 1);
      setActiveSection('overview');
      setAppExperienceMode('COMMAND_CENTER');
    } catch (err) {
      console.error('Scenario start error:', err);
    }
  };

  const handleSimulateIntervention = async (action: InterventionAction) => {
    if (!currentSituation) return;
    try {
      const res = await api.simulateIntervention(currentSituation.situation_id, action);
      setRefreshTrigger((prev) => prev + 1);
      return res;
    } catch (err) {
      console.error('Failed to simulate intervention from story:', err);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <CinematicIntelligenceBackground activeState={activeState} isSimulating={isSimulating}>
      {/* Holographic Cyber-Eye Brand Preloader on Initial Startup */}
      {showPreloader && (
        <SentinelPreloader onDismiss={() => setShowPreloader(false)} />
      )}

      {/* Top Operational Command Header with Floating Glass Navigation */}
      {appExperienceMode === 'COMMAND_CENTER' && (
        <Header
          systemStatus="ONLINE"
          activeState={activeState}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          systemMode="SIMULATION"
          onOpenJuryTour={() => setIsJuryTourOpen(true)}
          onOpenStoryExperience={() => setAppExperienceMode('STORY')}
          siteProfile={siteProfile}
          onSiteProfileChange={setSiteProfile}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          devMode={devMode}
          onToggleDevMode={() => setDevMode(!devMode)}
        />
      )}

      {/* Auth & Role Manager Modal */}
      <AuthModal />

      {/* 90-Second Jury Interactive Tour Modal */}
      <JuryTourModal
        isOpen={isJuryTourOpen}
        onClose={() => setIsJuryTourOpen(false)}
        onStartScenario={handleStartBreachScenario}
        onJumpToSection={(sec) => {
          setActiveSection(sec as MainNavSection);
          setAppExperienceMode('COMMAND_CENTER');
        }}
      />

      {/* Mode 1: Continuous Cinematic Product Story Journey */}
      {appExperienceMode === 'STORY' ? (
        <SentinelCinematicExperience
          situation={currentSituation}
          onEnterCommandCenter={() => setAppExperienceMode('COMMAND_CENTER')}
          onSimulateIntervention={handleSimulateIntervention}
          onStartScenario={handleStartBreachScenario}
        />
      ) : (
        /* Mode 2: Full Operational Command Center (Edge-to-Edge) */
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-6 lg:px-8 py-4 scrollbar-thin scrollbar-thumb-[#c9a15d]/25">
            <div className="max-w-7xl 2xl:max-w-[1680px] mx-auto w-full min-w-0">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      activeSection={activeSection}
                      onSelectSection={setActiveSection}
                      onSituationStateChange={setActiveState}
                      onRefreshTrigger={refreshTrigger}
                      devMode={devMode}
                      onCloseDevMode={() => setDevMode(false)}
                    />
                  }
                />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/situations" element={<SituationsPage />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </CinematicIntelligenceBackground>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
