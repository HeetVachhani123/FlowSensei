import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TeammateCursor } from '../components/TeammateCursor';

export const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'board' | 'retro' | 'dashboard'>('board');

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0d] text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Background ambient gradient glow */}
      <div className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
        
        {/* HERO SECTION */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Real-Time Kanban &amp; AI Sprint Retros
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
            FlowSensei combines the tactile speed of drag-and-drop Kanban boards with automated column bottleneck detection and instant AI-generated weekly retrospectives.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
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

          {/* INTERACTIVE PREVIEW TABS & SVG SHOWCASE */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-3 sm:p-6 max-w-5xl mx-auto">
            {/* Tab switchers */}
            <div className="flex items-center justify-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800/80 pb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('board')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'board'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                Live Kanban &amp; Bottlenecks
              </button>
              <button
                onClick={() => setActiveTab('retro')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'retro'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                AI Retrospectives
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                Projects Dashboard
              </button>
            </div>

            {/* Visual Screen Container */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-inner">
              {activeTab === 'board' && (
                <div className="relative w-full aspect-[16/9] max-h-[520px] overflow-hidden flex items-center justify-center">
                  {/* Live Multiplayer Teammate Cursors */}
                  <TeammateCursor
                    name="Tanay"
                    color="#6366f1"
                    className="animate-cursor-1 top-0 left-0"
                  />
                  <TeammateCursor
                    name="Kamil"
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
                    <text x="40" y="26" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="14" fontWeight="700" fill="#fafafa">Sprint 14 — Onboarding</text>
                    <rect x="680" y="10" width="92" height="22" rx="6" fill="#4f46e5" />
                    <text x="702" y="26" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fontWeight="600" fill="#fafafa">AI Retro</text>
                    
                    {/* Column 1: Backlog */}
                    <g transform="translate(40,65)">
                      <rect width="160" height="310" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">Backlog</text>
                      <text x="140" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fontWeight="600" fill="#a1a1aa">3</text>
                      
                      {/* Card 1 */}
                      <rect x="10" y="36" width="140" height="52" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="46" width="28" height="8" rx="2" fill="#ef4444" />
                      <text x="18" y="74" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Design sign-up flow</text>
                      
                      {/* Card 2 */}
                      <rect x="10" y="96" width="140" height="52" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <text x="18" y="128" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Wireframe payments</text>

                      {/* Card 3 */}
                      <rect x="10" y="156" width="140" height="52" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <rect x="18" y="166" width="28" height="8" rx="2" fill="#3b82f6" />
                      <text x="18" y="194" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Fix favicon on Safari</text>
                    </g>

                    {/* Column 2: In Progress (Bottleneck demonstration) */}
                    <g transform="translate(220,65)">
                      <rect width="160" height="310" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">In Progress</text>
                      <text x="140" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fontWeight="600" fill="#a1a1aa">2</text>
                      
                      {/* Card with Bottleneck Indicator */}
                      <rect x="10" y="36" width="140" height="60" rx="8" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                      <rect x="10" y="36" width="4" height="60" fill="#f59e0b" />
                      <text x="20" y="60" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Build email templates</text>
                      <rect x="20" y="72" width="56" height="16" rx="8" fill="#78350f" />
                      <circle cx="28" cy="80" r="3" fill="#f59e0b" />
                      <text x="35" y="83" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="8" fontWeight="700" fill="#fef3c7">STUCK</text>
                      
                      {/* Normal card */}
                      <rect x="10" y="104" width="140" height="52" rx="8" fill="#18181b" stroke="#3f3f46" />
                      <text x="18" y="136" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Stripe integration</text>
                    </g>

                    {/* Column 3: Review */}
                    <g transform="translate(400,65)">
                      <rect width="160" height="310" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">Review</text>
                      <text x="140" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fontWeight="600" fill="#a1a1aa">1</text>
                      <rect x="10" y="36" width="140" height="52" rx="8" fill="#18181b" stroke="#6366f1" />
                      <rect x="18" y="46" width="32" height="8" rx="2" fill="#6366f1" />
                      <text x="18" y="74" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">AI retro generator</text>
                    </g>

                    {/* Column 4: Done */}
                    <g transform="translate(580,65)">
                      <rect width="160" height="310" rx="10" fill="#121214" stroke="#27272a" />
                      <text x="14" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fontWeight="700" fill="#e4e4e7">Done</text>
                      <text x="140" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fontWeight="600" fill="#a1a1aa">2</text>
                      <rect x="10" y="36" width="140" height="52" rx="8" fill="#18181b" stroke="#10b98180" />
                      <text x="18" y="68" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Add dark mode toggle</text>
                      <rect x="10" y="96" width="140" height="52" rx="8" fill="#18181b" stroke="#10b98180" />
                      <text x="18" y="128" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Ship login page</text>
                    </g>
                  </svg>
                </div>
              )}

              {activeTab === 'retro' && (
                <div className="relative w-full aspect-[16/9] max-h-[520px] overflow-hidden flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" className="w-full h-full object-contain">
                    <defs>
                      <linearGradient id="landing-bg3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0c0c0d" />
                        <stop offset="100%" stopColor="#312e81" />
                      </linearGradient>
                    </defs>
                    <rect width="800" height="400" fill="url(#landing-bg3)" />
                    {/* Left panel */}
                    <rect x="20" y="20" width="180" height="360" rx="10" fill="#121214" stroke="#3f3f46" />
                    <text x="40" y="50" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="13" fontWeight="700" fill="#fafafa">AI Retrospectives</text>
                    <rect x="30" y="76" width="160" height="36" rx="6" fill="#4f46e5" />
                    <text x="58" y="100" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fontWeight="600" fill="#fafafa">+ Generate Retro</text>
                    <rect x="30" y="136" width="160" height="28" rx="6" fill="#312e81" />
                    <text x="42" y="154" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e4e4e7">Jul 31, 2026</text>
                    <rect x="30" y="172" width="160" height="28" rx="6" fill="#1f2937" />
                    <text x="42" y="190" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#a1a1aa">Jul 24, 2026</text>
                    
                    {/* Right report panel */}
                    <rect x="220" y="20" width="560" height="360" rx="10" fill="#121214" stroke="#3f3f46" />
                    <circle cx="755" cy="38" r="10" fill="#27272a" />
                    <text x="755" y="42" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#a1a1aa">✕</text>
                    <text x="250" y="64" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="18" fontWeight="800" fill="#fafafa">Sprint 14 — Retrospective</text>
                    <text x="250" y="100" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="14" fontWeight="700" fill="#fafafa">What went well</text>
                    <text x="260" y="122" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#d4d4d8">• Dark mode shipped ahead of schedule</text>
                    <text x="260" y="142" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#d4d4d8">• "Add card" dropped to 320ms P95</text>
                    
                    <text x="250" y="176" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="14" fontWeight="700" fill="#fafafa">What got stuck</text>
                    <text x="260" y="198" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#fca5a5">• *"Design sign-up flow"* — lingering in To Do</text>
                    <text x="260" y="218" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#fca5a5">• In Progress column bottleneck detected</text>
                    
                    <text x="250" y="252" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="14" fontWeight="700" fill="#fafafa">Suggestion for next week</text>
                    <rect x="250" y="266" width="500" height="64" rx="8" fill="#312e8150" stroke="#6366f1" />
                    <text x="266" y="294" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="11" fill="#e0e7ff">
                      <tspan x="266" dy="0">Set a WIP limit of 2 on In Progress and pair-design</tspan>
                      <tspan x="266" dy="14">the sign-up flow with the backend owner.</tspan>
                    </text>
                  </svg>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="relative w-full aspect-[16/9] max-h-[520px] overflow-hidden flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" className="w-full h-full object-contain">
                    <defs>
                      <linearGradient id="landing-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0c0c0d" />
                        <stop offset="100%" stopColor="#18181b" />
                      </linearGradient>
                    </defs>
                    <rect width="800" height="400" fill="url(#landing-bg)" />
                    {/* Top navbar */}
                    <rect x="0" y="0" width="800" height="40" fill="#0c0c0d" stroke="#27272a" />
                    <rect x="20" y="10" width="20" height="20" rx="4" fill="#6366f1" />
                    <text x="30" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fontWeight="800" fill="#ffffff" textAnchor="middle">F</text>
                    <text x="48" y="25" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="13" fontWeight="600" fill="#e4e4e7">FlowSensei</text>
                    
                    <circle cx="770" cy="20" r="10" fill="#6366f1" />
                    <text x="770" y="24" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fontWeight="700" fill="#ffffff" textAnchor="middle">A</text>
                    
                    <text x="100" y="86" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="22" fontWeight="700" fill="#fafafa">Projects</text>
                    <text x="100" y="108" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="12" fill="#a1a1aa">Manage your boards and workflows.</text>
                    
                    <g transform="translate(100,140)">
                      <rect width="160" height="110" rx="10" fill="#121214" stroke="#3f3f46" />
                      <text x="16" y="28" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="13" fontWeight="600" fill="#e4e4e7">Website Redesign</text>
                      <text x="16" y="98" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fill="#71717a">Open board →</text>
                    </g>
                    
                    <g transform="translate(280,140)">
                      <rect width="160" height="110" rx="10" fill="#121214" stroke="#3f3f46" />
                      <text x="16" y="28" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="13" fontWeight="600" fill="#e4e4e7">Mobile App v2</text>
                      <text x="16" y="98" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fill="#71717a">Open board →</text>
                    </g>
                    
                    <g transform="translate(460,140)">
                      <rect width="160" height="110" rx="10" fill="#121214" stroke="#3f3f46" />
                      <text x="16" y="28" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="13" fontWeight="600" fill="#e4e4e7">Sprint 14 — Onboarding</text>
                      <text x="16" y="98" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="10" fill="#71717a">Open board →</text>
                    </g>
                    
                    <g transform="translate(640,140)">
                      <rect width="80" height="110" rx="10" fill="#121214" stroke="#3f3f46" strokeDasharray="4 4" />
                      <text x="28" y="62" fontFamily="Segoe UI,Roboto,sans-serif" fontSize="22" fill="#52525b">+</text>
                    </g>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CORE FEATURES GRID */}
      <div className="py-20 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0c0c0d]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
              Engineered for Speed, Clarity, and Continuous Improvement
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              Everything your agile team needs to maintain flow and eliminate delivery bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Real-Time Multi-User Sync
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Supabase Realtime WebSockets deliver zero-latency updates across all connected teammates. Move cards, edit tickets, and watch changes instantly reflect.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Edge AI Retrospectives
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Click &apos;AI Retro&apos; to let your AI Sensei analyze your board structure, highlight wins, diagnose stuck items, and suggest actionable improvements for next sprint.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Automated Bottleneck Detection
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Heuristic dwell-time calculations automatically flag cards that stay in a column longer than 1.5x average, alerting your team before delays cascade.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
            How FlowSensei Works
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            A seamless three-step ritual for high-performing engineering &amp; product teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="p-6 rounded-xl bg-zinc-100/60 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl font-black text-indigo-500/30 dark:text-indigo-400/20 block mb-4">01</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Organize &amp; Share</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Create dedicated boards, invite team members with secure one-click tokens, and configure custom workflow stages.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-100/60 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl font-black text-indigo-500/30 dark:text-indigo-400/20 block mb-4">02</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Work in Flow</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Drag, reorder, assign color labels, and manage deadlines with optimistic UI response and live bottleneck highlights.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-100/60 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl font-black text-indigo-500/30 dark:text-indigo-400/20 block mb-4">03</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Reflect with Sensei</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Generate markdown retrospectives in seconds with Edge AI, track historical retros, and continuously optimize delivery velocity.
            </p>
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
            {user ? 'Enter FlowSensei Dashboard →' : 'Get Started with FlowSensei →'}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0d] text-xs text-zinc-500 dark:text-zinc-400">
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
