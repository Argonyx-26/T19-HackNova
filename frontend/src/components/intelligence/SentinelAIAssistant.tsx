import React, { useState } from 'react';
import { Sparkles, Send, Camera, X, MessageSquare, Terminal } from 'lucide-react';

interface QuickPrompt {
  id: string;
  query: string;
  answer: string;
  targetCamera?: string;
  targetSection?: string;
}

const PRESET_QUERIES: QuickPrompt[] = [
  {
    id: 'q1',
    query: 'Where is the stolen bag?',
    answer: 'Unattended bag at Table 4 (CAM-01 Cafe) was taken by Suspect #104 at 15:18:42 and is currently moving towards East Transit Corridor (CAM-02).',
    targetCamera: 'CAM-01',
    targetSection: 'cyber_physical'
  },
  {
    id: 'q2',
    query: 'Show server room breach camera',
    answer: 'Door #02 Server Room (CAM-03) recorded card swipe by Badge #881 followed by an unregistered entity tailgating within 1.8 seconds.',
    targetCamera: 'CAM-03',
    targetSection: 'cyber_physical'
  },
  {
    id: 'q3',
    query: 'Why did state escalate to CRITICAL?',
    answer: 'Correlated physical keycard tailgating at Server Room B with concurrent 820 Mbps outbound network exfiltration from IP 192.168.1.105.',
    targetSection: 'overview'
  },
  {
    id: 'q4',
    query: 'Simulate sector lockdown counterfactual',
    answer: 'Executing LOCKDOWN counterfactual: Risk drops from 0.94 to 0.12 (-87.2%), operational impact: 1,420 users temporarily restricted.',
    targetSection: 'simulation'
  }
];

interface SentinelAIAssistantProps {
  onSelectSection?: (section: string) => void;
}

export const SentinelAIAssistant: React.FC<SentinelAIAssistantProps> = ({ onSelectSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeResponse, setActiveResponse] = useState<QuickPrompt | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleSearch = (p?: QuickPrompt) => {
    const promptToUse =
      p ||
      PRESET_QUERIES.find((q) => q.query.toLowerCase().includes(query.toLowerCase())) || {
        id: 'custom',
        query: query || 'System status overview',
        answer: `SENTINEL-X AI Reasoning Engine correlates 1,242 multi-source signals into active Situation #sit-20260925-001 (CRITICAL state).`,
        targetSection: 'overview'
      };

    setIsThinking(true);
    setTimeout(() => {
      setActiveResponse(promptToUse);
      setIsThinking(false);
      if (promptToUse.targetSection && onSelectSection) {
        onSelectSection(promptToUse.targetSection);
      }
    }, 300);
  };

  return (
    <>
      {/* Discreet Bottom-Right Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group px-4 py-2.5 rounded-full bg-[#120c06]/95 hover:bg-[#20150a] border border-[#c9a15d]/40 hover:border-[#f0d28f] shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(201,161,93,0.2)] backdrop-blur-2xl flex items-center space-x-2 text-xs font-mono font-bold text-[#f0d28f] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#f0d28f] group-hover:rotate-12 transition-transform" />
          <span>◇ Ask SENTINEL-X</span>
        </button>
      </div>

      {/* Slide-over Command / Search Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0704]/98 border-l border-[#c9a15d]/30 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#24170c] border border-[#c9a15d]/40 text-[#f0d28f]">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-[#fff6e4]">
                      SENTINEL-X ASSISTANT
                    </h3>
                    <p className="text-[10px] font-mono text-[#a3927a]">
                      Natural language situational reasoning & queries
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-[#a3927a] hover:text-white hover:bg-[#1a1208] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Response Display */}
              {activeResponse && (
                <div className="p-4 rounded-2xl bg-[#140e08] border border-[#c9a15d]/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono text-[#f0d28f] font-bold">
                    <span>QUERY: "{activeResponse.query}"</span>
                    <button
                      onClick={() => setActiveResponse(null)}
                      className="text-[#a3927a] hover:text-white text-[10px]"
                    >
                      [Clear]
                    </button>
                  </div>
                  <p className="text-xs text-[#d5c7b3] font-sans leading-relaxed">
                    {activeResponse.answer}
                  </p>
                  {activeResponse.targetCamera && (
                    <div className="pt-2 border-t border-[#c9a15d]/15 flex items-center gap-1.5 text-[11px] font-mono text-[#f0d28f]">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Focusing sensor feed: {activeResponse.targetCamera}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Preset Quick Actions */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[#a3927a] uppercase tracking-wider block">
                  Suggested Questions
                </span>
                <div className="space-y-1.5">
                  {PRESET_QUERIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSearch(p)}
                      className="w-full text-left p-3 rounded-xl bg-[#120c06] hover:bg-[#1f150a] border border-[#c9a15d]/20 hover:border-[#f0d28f]/50 text-xs font-mono text-[#d5c7b3] hover:text-[#fff6e4] transition flex items-center justify-between group cursor-pointer"
                    >
                      <span>{p.query}</span>
                      <MessageSquare className="w-3.5 h-3.5 text-[#a3927a] group-hover:text-[#f0d28f] transition" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Form at Bottom */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="pt-4 border-t border-[#c9a15d]/20 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about active incidents, cameras, or simulations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-[#120c06] border border-[#c9a15d]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#fff6e4] placeholder-[#7a6a55] focus:outline-none focus:border-[#f0d28f] font-mono"
              />
              <button
                type="submit"
                disabled={isThinking}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] hover:brightness-110 text-[#050403] font-mono text-xs font-bold transition shrink-0 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isThinking ? (
                  <span>Thinking...</span>
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
