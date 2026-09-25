import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { NormalizedEvent } from '../types';
import { EventFeed } from '../components/events/EventFeed';
import { RefreshCw } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getEvents({ limit: 100 });
      setEvents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
            Normalized Security Signals Repository
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Raw events normalized from CCTV, Network, Access Control, and IoT sources.
          </p>
        </div>
        <button
          onClick={loadEvents}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sentinel-surface border border-sentinel-border text-xs font-mono text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="h-[650px]">
        <EventFeed events={events} />
      </div>
    </div>
  );
};
