import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TeammateCursor } from '../components/TeammateCursor';

export const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'board' | 'retro' | 'dashboard'>('board');
  const [activeFeatureStep, setActiveFeatureStep] = useState<number>(1);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0d] text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Ambient gradient glow */}
      <div className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-indigo-600/20 via-purple-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
        
        {/* HERO SECTION */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Engineering Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Real-Time Kanban • Edge AI Retrospectives
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Master Your Team&apos;s Flow with{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              AI Sensei
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FlowSensei combines tactile drag-and-drop Kanban with automated dwell-time bottleneck detection and instant AI-generated weekly sprint retrospectives.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{user ? 'Enter Dashboard' : 'Open Live Workspace'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <a
              href="https://github.com/HeetVachhani123/FlowSensei"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-[#18181b] hover:bg-zinc-100 dark:hover:bg-[#202024] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-semibold text-base transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>GitHub</span>
            </a>
          </div>

          {/* INTERACTIVE PREVIEW TABS & PRODUCT SHOWCASE */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-3 sm:p-6 max-w-5xl mx-auto">
            {/* Tab switchers */}
            <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 sm:pb-4 overflow-x-auto custom-scrollbar flex-nowrap">
              <button
                onClick={() => setActiveTab('board')}
                className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                  activeTab === 'board'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="font-mono text-[10px] sm:text-xs opacity-75">01</span>
                <span>Live Kanban</span>
                <span className="hidden sm:inline">&amp; Bottlenecks</span>
              </button>
              <button
                onClick={() => setActiveTab('retro')}
                className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                  activeTab === 'retro'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="font-mono text-[10px] sm:text-xs opacity-75">02</span>
                <span>AI Retrospectives</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="font-mono text-[10px] sm:text-xs opacity-75">03</span>
                <span>Projects Dashboard</span>
              </button>
            </div>

            {/* Visual Screen Container */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#0c0c0d] shadow-inner">
              {activeTab === 'board' && (
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[280px] sm:min-h-[420px] max-h-[520px] overflow-hidden flex items-center justify-center">
                  {/* Clean Anchored Teammate Presence Badges at top right */}
                  <div className="absolute top-2.5 right-28 z-20 hidden sm:flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-full text-[11px] font-mono">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-zinc-300">2 active peers</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">User-1</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">User-2</span>
                  </div>

                  {/* Teammate Cursors wandering inside card areas (safely below headers) */}
                  <TeammateCursor
                    name="User-1"
                    color="#6366f1"
                    className="animate-cursor-1 top-0 left-0"
                  />
                  <TeammateCursor
                    name="User-2"
                    color="#10b981"
                    className="animate-cursor-2 top-0 left-0"
                  />

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" className="w-full h-full object-contain">
                    <defs>
                      <linearGradient id="landing-bg2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0c0c0d" />
                        <stop offset="100%" stopColor="#111827" />
                      </linearGradient>
                    </defs>
                    <rect width="800" height="400" fill="url(#landing-bg2)" />
                    {/* Header */}
                    <rect x="0" y="0" width="800" height="40" fill="#0c0c0d" stroke="#27272a" />
                    <text x="40" y="25" fontFamily="Outfit,sans-serif" fontSize="13" fontWeight="700" fill="#fafafa">Sprint 14 — Core Platform &amp; AI Flow</text>
                    
                    {/* Retro Button */}
                    <rect x="680" y="9" width="94" height="23" rx="6" fill="#4f46e5" />
                    <text x="702" y="24" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#fafafa">✨ AI Retro</text>
                    
                    {/* Column 1: Backlog */}
                    <g transform="translate(30,55)">
                      <rect width="170" height="325" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Outfit,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">Backlog</text>
                      <text x="146" y="24" fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="600" fill="#a1a1aa">3</text>
                      
                      {/* Card 1 */}
                      <rect x="10" y="36" width="150" height="62" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="44" width="46" height="12" rx="3" fill="#3b82f620" stroke="#3b82f660" />
                      <text x="23" y="53" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#93c5fd">FEATURE</text>
                      <text x="18" y="74" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Design empty states</text>
                      <text x="18" y="88" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#71717a">FS-101 • Oct 24</text>
                      
                      {/* Card 2 */}
                      <rect x="10" y="106" width="150" height="62" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="114" width="40" height="12" rx="3" fill="#8b5cf620" stroke="#8b5cf660" />
                      <text x="23" y="123" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#c4b5fd">DOCS</text>
                      <text x="18" y="144" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Onboarding tour copy</text>
                      <text x="18" y="158" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#71717a">FS-102 • Oct 26</text>

                      {/* Card 3 */}
                      <rect x="10" y="176" width="150" height="62" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="184" width="40" height="12" rx="3" fill="#10b98120" stroke="#10b98160" />
                      <text x="23" y="193" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#6ee7b7">AUDIT</text>
                      <text x="18" y="214" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Mobile touch targets</text>
                      <text x="18" y="228" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#71717a">FS-103 • Oct 29</text>
                    </g>

                    {/* Column 2: In Progress (Bottleneck demonstration) */}
                    <g transform="translate(220,55)">
                      <rect width="170" height="325" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Outfit,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">In Progress</text>
                      <text x="146" y="24" fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="600" fill="#a1a1aa">2</text>
                      
                      {/* Card with Bottleneck Indicator */}
                      <rect x="10" y="36" width="150" height="74" rx="8" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                      <rect x="10" y="36" width="4" height="74" fill="#f59e0b" />
                      <rect x="18" y="44" width="34" height="12" rx="3" fill="#ef444420" stroke="#ef444460" />
                      <text x="24" y="53" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="700" fill="#fca5a5">BUG</text>
                      
                      {/* Stuck Badge */}
                      <rect x="94" y="44" width="58" height="13" rx="6" fill="#78350f" />
                      <circle cx="102" cy="50" r="2.5" fill="#f59e0b" />
                      <text x="108" y="53" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="700" fill="#fef3c7">STUCK 4d</text>
                      
                      <text x="18" y="74" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Fix Safari drag ghost</text>
                      <text x="18" y="94" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#f59e0b">Dwell: 1.5x avg</text>

                      {/* Normal card */}
                      <rect x="10" y="118" width="150" height="62" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="126" width="46" height="12" rx="3" fill="#3b82f620" stroke="#3b82f660" />
                      <text x="23" y="135" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#93c5fd">FEATURE</text>
                      <text x="18" y="156" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Rate limit retro endpoint</text>
                      <text x="18" y="170" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#71717a">FS-105 • Oct 18</text>
                    </g>

                    {/* Column 3: Review */}
                    <g transform="translate(410,55)">
                      <rect width="170" height="325" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Outfit,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">Review</text>
                      <text x="146" y="24" fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="600" fill="#a1a1aa">2</text>
                      
                      <rect x="10" y="36" width="150" height="62" rx="8" fill="#18181b" stroke="#6366f1" strokeWidth="1.2" />
                      <rect x="18" y="44" width="46" height="12" rx="3" fill="#6366f120" stroke="#6366f160" />
                      <text x="23" y="53" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#c7d2fe">DESIGN</text>
                      <text x="18" y="74" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Token migration</text>
                      <text x="18" y="88" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#818cf8">In review by User-1</text>

                      <rect x="10" y="106" width="150" height="62" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="114" width="54" height="12" rx="3" fill="#10b98120" stroke="#10b98160" />
                      <text x="23" y="123" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#6ee7b7">BACKEND</text>
                      <text x="18" y="144" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Edge function logs</text>
                      <text x="18" y="158" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#71717a">FS-107 • Oct 17</text>
                    </g>

                    {/* Column 4: Done */}
                    <g transform="translate(600,55)">
                      <rect width="170" height="325" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Outfit,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">Done</text>
                      <text x="146" y="24" fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="600" fill="#a1a1aa">3</text>
                      
                      <rect x="10" y="36" width="150" height="62" rx="8" fill="#18181b" stroke="#10b98160" />
                      <rect x="18" y="44" width="46" height="12" rx="3" fill="#10b98120" stroke="#10b98160" />
                      <text x="23" y="53" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#6ee7b7">SHIPPED</text>
                      <text x="18" y="74" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Dark mode theme switch</text>
                      <text x="18" y="88" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#10b981">✓ Completed</text>

                      <rect x="10" y="106" width="150" height="62" rx="8" fill="#18181b" stroke="#10b98160" />
                      <rect x="18" y="114" width="46" height="12" rx="3" fill="#10b98120" stroke="#10b98160" />
                      <text x="23" y="123" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="600" fill="#6ee7b7">TESTING</text>
                      <text x="18" y="144" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="600" fill="#e4e4e7">Vitest unit test suite</text>
                      <text x="18" y="158" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#10b981">✓ 9/9 passing</text>
                    </g>
                  </svg>
                </div>
              )}

              {activeTab === 'retro' && (
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[280px] sm:min-h-[420px] max-h-[520px] overflow-hidden flex items-center justify-center p-2 sm:p-4">
                  <div className="w-full h-full rounded-lg bg-[#121214] border border-zinc-800 flex overflow-hidden text-left">
                    {/* Retro Sidebar */}
                    <div className="w-48 bg-[#0c0c0d] border-r border-zinc-800 p-3 hidden sm:flex flex-col">
                      <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        AI Retros
                      </div>
                      <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-800/60 mb-2">
                        <p className="text-xs font-semibold text-indigo-200">Sprint 14 Retro</p>
                        <p className="text-[10px] font-mono text-indigo-400">Just now • Sensei</p>
                      </div>
                      <div className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300">
                        <p className="text-xs">Sprint 13 Retro</p>
                        <p className="text-[10px] font-mono">7 days ago</p>
                      </div>
                    </div>

                    {/* Retro Markdown Preview */}
                    <div className="flex-1 p-3 sm:p-6 overflow-y-auto font-sans">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white">Sprint 14 Retrospective — Core Platform &amp; AI Flow</h3>
                          <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-0.5">Model: openai/gpt-oss-120b via Groq Edge Function</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-mono font-semibold">
                          Health: 88%
                        </span>
                      </div>

                      <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
                        <div>
                          <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                            <span>🚀</span> What Went Well
                          </h4>
                          <p className="text-zinc-400 leading-relaxed">
                            Dark mode system tokens and optimistic card drag-and-drop shipped ahead of schedule with sub-16ms local latency.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                            <span>⚠️</span> Bottlenecks Detected
                          </h4>
                          <p className="text-zinc-400 leading-relaxed">
                            <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded font-mono text-xs">Fix Safari drag ghost image</code> lingered in In Progress for 4+ days (exceeding 1.5x column average).
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/50">
                          <h4 className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                            <span>🎯</span> Recommended Action Items
                          </h4>
                          <p className="text-zinc-300 leading-relaxed">
                            Enforce a WIP limit of 2 items on In Progress. Add rate limiting to retro triggers to maintain predictable token consumption.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[280px] sm:min-h-[420px] max-h-[520px] overflow-hidden flex items-center justify-center p-2 sm:p-4">
                  <div className="w-full h-full rounded-lg bg-[#121214] border border-zinc-800 p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Workspace
                          </span>
                          <h3 className="text-xl font-bold text-white mt-1">Engineering Boards</h3>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-indigo-500 text-white font-semibold text-xs">+ Create Board</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-zinc-700">
                          <h4 className="font-semibold text-white text-sm">Sprint 14 — Core Flow</h4>
                          <p className="text-[11px] font-mono text-zinc-400 mt-4">4 cols • 11 tasks</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-zinc-700">
                          <h4 className="font-semibold text-white text-sm">Mobile App v2</h4>
                          <p className="text-[11px] font-mono text-zinc-400 mt-4">3 cols • 8 tasks</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-zinc-700">
                          <h4 className="font-semibold text-white text-sm">AI Copilot Roadmap</h4>
                          <p className="text-[11px] font-mono text-zinc-400 mt-4">4 cols • 14 tasks</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-4 border-t border-zinc-800">
                      <span>Realtime WebSockets: Connected</span>
                      <span>RLS Security: Enforced</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ANNOTATED CAPABILITIES WALKTHROUGH (Replacing generic pastel chips) */}
      <div className="py-20 border-t border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-[#0c0c0d]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Tactile &amp; Intelligent</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1 mb-4">
              Engineered for High-Velocity Software Teams
            </h2>
            <p className="text-base text-zinc-700 dark:text-zinc-300">
              FlowSensei replaces static project boards with a living, intelligent workflow engine that senses bottlenecks before they cascade.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Interactive Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800/60">
                    REALTIME SYNC
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">&lt; 16ms optimistic drop</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Zero-Latency Multiplayer Flow
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed mb-6">
                  Supabase Realtime WebSockets dispatch optimistic DOM updates immediately while syncing state across all connected engineers with live presence cursors.
                </p>
              </div>

              {/* Annotated mini mockup */}
              <div className="p-3 rounded-xl bg-zinc-100/90 dark:bg-[#0c0c0d] border border-zinc-200/90 dark:border-zinc-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-semibold">
                  <span>POSTGRES_CHANGES</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    CONNECTED
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-between shadow-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">FS-101 • Safari ghost drag</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">User-1 moved</span>
                </div>
              </div>
            </div>

            {/* Interactive Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded border border-amber-300/80 dark:border-amber-800/60">
                    BOTTLENECK RADAR
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Dwell-Time Heuristic</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Automated Stuck Item Detection
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed mb-6">
                  Cards lingering in a column 1.5x longer than the column average are automatically highlighted with pulsing amber warning badges.
                </p>
              </div>

              {/* Annotated mini mockup with high-contrast light and dark styling */}
              <div className="p-3 rounded-xl bg-zinc-100/90 dark:bg-[#0c0c0d] border border-zinc-200/90 dark:border-zinc-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-semibold">
                  <span>COLUMN: IN PROGRESS</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">1.5x DWELL</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 flex items-center justify-between shadow-xs">
                  <span className="font-bold text-amber-950 dark:text-amber-200">FS-104 • Retro rate limit</span>
                  <span className="bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 px-1.5 py-0.5 rounded text-[10px] font-extrabold">STUCK 4d</span>
                </div>
              </div>
            </div>

            {/* Interactive Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded border border-purple-300/80 dark:border-purple-800/60">
                    EDGE AI SENSEI
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Groq 120B Edge</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  One-Click Weekly Retros
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed mb-6">
                  Supabase Edge Functions process board distribution and generate structured sprint retrospectives with concrete recommendations.
                </p>
              </div>

              {/* Annotated mini mockup */}
              <div className="p-3 rounded-xl bg-zinc-100/90 dark:bg-[#0c0c0d] border border-zinc-200/90 dark:border-zinc-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-semibold">
                  <span>REPORT STREAMING</span>
                  <span className="text-indigo-700 dark:text-indigo-400 font-bold">READY</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between shadow-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">Action: Enforce WIP=2</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-extrabold">High Impact</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* REFINED WORKFLOW WALKTHROUGH (Replacing generic 01/02/03 steps) */}
      <div className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Product Walkthrough</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1 mb-4">
            How FlowSensei Elevates Team Delivery
          </h2>
          <p className="text-base text-zinc-700 dark:text-zinc-300">
            A continuous loop from sprint planning to automated retrospective reflection.
          </p>
        </div>

        {/* Step-by-Step Interactive Workflow Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 shadow-lg">
          {/* Step Selector Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => setActiveFeatureStep(1)}
              className={`text-left p-4 rounded-xl border transition-all ${
                activeFeatureStep === 1
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-transparent'
              }`}
            >
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">STEP 01</span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Organize &amp; Collaborate</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Create dedicated boards and invite teammates via secure tokens.</p>
            </button>

            <button
              onClick={() => setActiveFeatureStep(2)}
              className={`text-left p-4 rounded-xl border transition-all ${
                activeFeatureStep === 2
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-transparent'
              }`}
            >
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">STEP 02</span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Execute in Tactical Flow</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Drag tickets with instant optimistic feedback and live dwell warnings.</p>
            </button>

            <button
              onClick={() => setActiveFeatureStep(3)}
              className={`text-left p-4 rounded-xl border transition-all ${
                activeFeatureStep === 3
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-transparent'
              }`}
            >
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">STEP 03</span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Reflect with AI Sensei</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Generate weekly retrospectives and track velocity improvements over time.</p>
            </button>
          </div>

          {/* Dynamic Walkthrough Content Display */}
          <div className="p-6 rounded-xl bg-zinc-50 dark:bg-[#0c0c0d] border border-zinc-200 dark:border-zinc-800/80">
            {activeFeatureStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Phase 1: Sprint Initiation</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-2 mb-3">Instant Workspace Provisioning</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                    Launch new boards in seconds, invite collaborators via secure URL tokens, and configure custom workflow columns. Row-Level Security ensures strict multi-tenant privacy across all records.
                  </p>
                  <ul className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1.5">
                    <li className="flex items-center gap-2"><span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span> 1-Click invite link generation with token verification</li>
                    <li className="flex items-center gap-2"><span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span> Granular Row-Level Security (RLS) enforcement</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-3 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Share Invite Link</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">TOKEN READY</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-100 dark:bg-[#121214] border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 truncate">
                    https://flow-sensei.app/board/a1b2c3d4?invite=98fc...
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans">Team members join with write permissions on acceptance.</div>
                </div>
              </div>
            )}

            {activeFeatureStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">Phase 2: Agile Execution</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-2 mb-3">Live Bottleneck Awareness</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                    Engineers drag and reorder cards with zero waiting time. If a card sits in a column longer than 1.5x the column&apos;s running average, FlowSensei triggers an ambient warning so the team can unblock it together.
                  </p>
                  <ul className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1.5">
                    <li className="flex items-center gap-2"><span className="text-amber-600 dark:text-amber-400 font-bold">✓</span> Dwell time calculated via card updated_at heuristic</li>
                    <li className="flex items-center gap-2"><span className="text-amber-600 dark:text-amber-400 font-bold">✓</span> Color-coded tags (Bug, Feature, Docs, Enhancement)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-3 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Bottleneck Monitor</span>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/60 px-1.5 py-0.5 rounded font-bold">1 CARD STUCK</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 shadow-xs">
                    <div className="font-bold text-amber-950 dark:text-amber-200 text-xs">FS-103 • Safari ghost drag</div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-1 font-semibold">Dwell: 4 days (Avg: 2.2 days)</div>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans">Dwell time timer refreshes every 30s in the background.</div>
                </div>
              </div>
            )}

            {activeFeatureStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60">Phase 3: Sprint Reflection</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-2 mb-3">AI Retrospective Synthesis</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                    Click &apos;AI Retro&apos; at the end of the sprint to stream a comprehensive markdown retrospective generated by Groq&apos;s open model on Supabase Edge Functions.
                  </p>
                  <ul className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1.5">
                    <li className="flex items-center gap-2"><span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Summarizes completed tasks and stalled tickets</li>
                    <li className="flex items-center gap-2"><span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Delivers concrete, actionable recommendations for next sprint</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-3 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Sprint 14 Retro Report</span>
                    <span className="text-[10px] text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-800/60 px-1.5 py-0.5 rounded font-bold">SAVED TO DB</span>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50/90 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800/60 shadow-xs">
                    <div className="font-bold text-purple-950 dark:text-purple-200 text-xs">Next Sprint Focus: WIP Limits</div>
                    <div className="text-[11px] text-purple-800 dark:text-purple-300 mt-1 font-semibold">Cap In Progress at 2 tickets to avoid Safari drag delay.</div>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans">Historical retros stored permanently per board.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="py-16 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Ready to eliminate workflow bottlenecks?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto text-base">
            Join modern product teams shipping faster with real-time collaboration and AI-driven retrospectives.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            {user ? 'Enter FlowSensei Workspace →' : 'Get Started with FlowSensei →'}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0d] text-xs text-zinc-500 dark:text-zinc-400 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs">
              F
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">FlowSensei</span>
            <span>— Real-Time Kanban with AI Retros</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/HeetVachhani123/FlowSensei" target="_blank" rel="noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              GitHub
            </a>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                Sign in
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
};
