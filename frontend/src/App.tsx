import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { EventsPage } from './pages/Events';
import { SituationsPage } from './pages/Situations';
import type { SituationState } from './types';
import { api } from './services/api';

function App() {
  const [activeState, setActiveState] = useState<SituationState>('NORMAL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-sentinel-bg flex flex-col font-sans text-slate-100">
        {/* Top Operational Header */}
        <Header
          systemStatus="ONLINE"
          activeState={activeState}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Center Split: Sidebar & Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      onSituationStateChange={setActiveState}
                      onRefreshTrigger={refreshTrigger}
                    />
                  }
                />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/situations" element={<SituationsPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
