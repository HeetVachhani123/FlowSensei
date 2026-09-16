import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import {  useToast  } from '../../hooks/useToast';

type Retro = {
  id: string;
  board_id: string;
  content: string;
  created_at: string;
};

type RetroModalProps = {
  boardId: string;
  onClose: () => void;
};

export const RetroModal = ({ boardId, onClose }: RetroModalProps) => {
  const [retros, setRetros] = useState<Retro[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRetro, setSelectedRetro] = useState<Retro | null>(null);
  const [deletingRetroId, setDeletingRetroId] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const lastGenerateTime = React.useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const fetchRetros = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('retros')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRetros(data);
      if (data.length > 0) setSelectedRetro(data[0]);
    }
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    fetchRetros();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchRetros, onClose]);

  const handleGenerate = async () => {
    // 5-second client-side rate limit cooldown
    const now = Date.now();
    if (generating || cooldownSeconds > 0 || now - lastGenerateTime.current < 5000) {
      toast({ title: 'Please wait', description: 'Rate limit cooldown in effect. Please wait a few seconds.', variant: 'warning' });
      return;
    }
    lastGenerateTime.current = now;
    
    setGenerating(true);
    try {
      // 1. Fetch current board data to send to AI
      const { data: columns } = await supabase.from('columns').select('*').eq('board_id', boardId);
      const { data: cards } = await supabase.from('cards').select('*, columns!inner(board_id)').eq('columns.board_id', boardId);

      // Guard against empty board before calling AI service
      if (!cards || cards.length === 0) {
        toast({
          title: 'No cards to analyze',
          description: 'Add some tasks to your board before generating a retrospective.',
          variant: 'warning',
        });
        setGenerating(false);
        return;
      }

      const payload = {
        columns: columns || [],
        cards: cards || [],
      };

      // 2. Call our Supabase Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-retro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate retro');
      }

      const { content } = responseData;

      // 3. Save to database
      const { data: newRetro, error: insertError } = await supabase
        .from('retros')
        .insert([{ board_id: boardId, content }])
        .select()
        .single();

      if (insertError) throw insertError;

      setRetros(prev => [newRetro, ...prev]);
      setSelectedRetro(newRetro);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error generating retro', description: message, variant: 'error' });
    } finally {
      setGenerating(false);
      setCooldownSeconds(5);
    }
  };

  // Delete an existing retrospective
  const handleDeleteRetro = async (e: React.MouseEvent, retroId: string) => {
    e.stopPropagation();
    setDeletingRetroId(retroId);
    const { error } = await supabase.from('retros').delete().eq('id', retroId);
    setDeletingRetroId(null);
    if (error) {
      toast({ title: 'Could not delete retro', description: error.message, variant: 'error' });
    } else {
      const remaining = retros.filter(r => r.id !== retroId);
      setRetros(remaining);
      if (selectedRetro?.id === retroId) setSelectedRetro(remaining[0] || null);
      toast({ title: 'Retrospective deleted', variant: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-backdrop-fade">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="AI Retrospectives"
        className="bg-white dark:bg-[#18181b] w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex overflow-hidden animate-modal-pop"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Left Sidebar: Retro History */}
        <div className="w-64 bg-zinc-50 dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Retrospectives
            </h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            <button
              onClick={handleGenerate}
              disabled={generating || cooldownSeconds > 0}
              aria-label={generating ? 'Analyzing board' : cooldownSeconds > 0 ? `Rate limit cooldown active, wait ${cooldownSeconds} seconds` : 'Generate Retro'}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm disabled:opacity-50 min-h-[42px]"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : cooldownSeconds > 0 ? (
                <svg className="w-4 h-4 animate-spin text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="30 60" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              )}
              {generating ? 'Analyzing...' : cooldownSeconds > 0 ? `Wait (${cooldownSeconds}s)` : 'Generate Retro'}
            </button>

            <h4 className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">Past Retros</h4>
            
            {loading ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg"></div>
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg"></div>
              </div>
            ) : retros.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 text-center py-4">No retros yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {retros.map(retro => (
                  <div key={retro.id} className="group relative">
                    <button
                      onClick={() => setSelectedRetro(retro)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors pr-8 ${selectedRetro?.id === retro.id ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium'}`}
                    >
                      {new Date(retro.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </button>
                    {/* Delete retro button */}
                    <button
                      onClick={(e) => handleDeleteRetro(e, retro.id)}
                      disabled={deletingRetroId === retro.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label="Delete retrospective"
                    >
                      {deletingRetroId === retro.id ? (
                        <div className="w-3.5 h-3.5 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Retro Markdown Viewer */}
        <div className="flex-1 flex flex-col relative bg-white dark:bg-[#18181b]">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={onClose} 
              aria-label="Close retrospective modal"
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white/50 dark:bg-[#18181b]/50 backdrop-blur rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {generating ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="font-medium animate-pulse">Sensei is analyzing your board...</p>
              </div>
            ) : selectedRetro ? (
              <div className="prose prose-zinc dark:prose-invert max-w-3xl mx-auto prose-headings:font-bold prose-a:text-indigo-500">
                <ReactMarkdown>{selectedRetro.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                <svg className="w-16 h-16 mb-4 opacity-40 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p className="font-medium">Generate your first AI Retrospective</p>
                <p className="text-sm mt-1">Get insights on what went well and what got stuck.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
