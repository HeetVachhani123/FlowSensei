// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { seedDemoBoard } from '../lib/seedDemoBoard';

type Board = {
  id: string;
  name: string;
  created_at: string;
};

// Aggregated column & task count metadata per board
type BoardMeta = {
  columnCount: number;
};

export const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardMeta, setBoardMeta] = useState<Record<string, BoardMeta>>({});
  const [totalCardsCount, setTotalCardsCount] = useState<number>(0);
  const [newBoardName, setNewBoardName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<{ id: string, name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const loadedBoards = data || [];
      setBoards(loadedBoards);

      // Fetch column counts for all boards in a single query
      if (loadedBoards.length > 0) {
        const { data: colData } = await supabase
          .from('columns')
          .select('id, board_id')
          .in('board_id', loadedBoards.map(b => b.id));

        const columnList = colData || [];
        const counts: Record<string, BoardMeta> = {};
        loadedBoards.forEach(b => { counts[b.id] = { columnCount: 0 }; });
        columnList.forEach(c => {
          if (counts[c.board_id]) counts[c.board_id].columnCount++;
        });
        setBoardMeta(counts);

        // Fetch total cards count across the user's columns
        if (columnList.length > 0) {
          const { count } = await supabase
            .from('cards')
            .select('id', { count: 'exact', head: true })
            .in('column_id', columnList.map(c => c.id));
          setTotalCardsCount(count || 0);
        } else {
          setTotalCardsCount(0);
        }
      } else {
        setTotalCardsCount(0);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const newBoardId = crypto.randomUUID();

      const { error: boardError } = await supabase
        .from('boards')
        .insert([{ id: newBoardId, name: newBoardName.trim(), created_by: userData.user.id }]);
      if (boardError) throw boardError;

      const { error: memberError } = await supabase
        .from('board_members')
        .insert([{ board_id: newBoardId, user_id: userData.user.id, role: 'owner' }]);
      if (memberError) throw memberError;

      // Create default columns for new boards
      await supabase.from('columns').insert([
        { board_id: newBoardId, name: 'To Do', position: 0 },
        { board_id: newBoardId, name: 'In Progress', position: 1 },
        { board_id: newBoardId, name: 'Done', position: 2 },
      ]);

      setNewBoardName('');
      navigate(`/board/${newBoardId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleSeedDemoBoard = async () => {
    try {
      setSeedingDemo(true);
      const result = await seedDemoBoard();
      toast({
        title: 'Demo board ready',
        description: 'Loaded "Sprint 14 — Core Platform & AI Flow" with sample cards.',
        variant: 'success'
      });
      navigate(`/board/${result.boardId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Failed to seed demo board', description: message, variant: 'error' });
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, boardId: string, boardName: string) => {
    e.stopPropagation();
    setBoardToDelete({ id: boardId, name: boardName });
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      setDeleting(true);
      const { error } = await supabase.from('boards').delete().eq('id', boardToDelete.id);
      if (error) throw error;
      setBoards(prev => prev.filter(b => b.id !== boardToDelete.id));
      toast({ title: 'Board deleted', variant: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error deleting board', description: message, variant: 'error' });
    } finally {
      setDeleting(false);
      setBoardToDelete(null);
    }
  };

  // Filter boards based on active search query
  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format relative timestamp in monospace style
  const relativeDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen animate-fade-in-up">
      {/* Header & Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400 font-semibold">Workspace Overview</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            Boards
            {!loading && (
              <span className="text-sm font-mono font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                {boards.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your agile sprints, track flow bottlenecks, and run AI retrospectives.
          </p>
        </div>

        {/* Demo Board Quick Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDemoBoard}
            disabled={seedingDemo}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-all active:scale-[0.98] flex items-center gap-2"
            title="Populate a clean, realistic engineering demo board"
          >
            {seedingDemo ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            <span>{seedingDemo ? 'Seeding workspace...' : 'Load Sample Demo Board'}</span>
          </button>
        </div>
      </div>

      {/* STATS / SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold mb-1">Active Boards</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
              {loading ? '—' : boards.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold mb-1">Total Tracked Tasks</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
              {loading ? '—' : totalCardsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold mb-1">AI Sensei & Realtime</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Online & Ready
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
      </div>
      
      {/* Create board + Search bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3 items-start justify-between">
        <form onSubmit={createBoard} className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <input
            type="text"
            aria-label="New board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New board title..."
            className="w-full sm:w-72 px-3.5 py-2.5 bg-white dark:bg-[#121214] border border-zinc-300 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/30 focus:border-indigo-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-sm transition-all"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-50 transition-all shadow-sm hover:shadow-indigo-500/25 active:scale-[0.98] whitespace-nowrap"
          >
            {creating ? 'Creating...' : '+ Create Board'}
          </button>
        </form>

        {/* Search bar */}
        {boards.length > 2 && (
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              aria-label="Search boards"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-[#121214] border border-zinc-300 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-sm transition-all"
            />
          </div>
        )}
      </div>

      {error && <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}

      {/* BOARDS GRID / SKELETON / EMPTY STATE */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-36 p-5 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2.5" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800/80 rounded w-16" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800/80 rounded w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBoards.length === 0 && boards.length === 0 ? (
          /* Rich Empty State */
          <div className="text-center py-20 px-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-[#121214]/30 max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No boards in your workspace yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
              Start by creating a fresh board for your team, or instantly load our realistic engineering demo board with standard sprint workflows and sample cards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSeedDemoBoard}
                disabled={seedingDemo}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {seedingDemo ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
                <span>Load Sample Engineering Board</span>
              </button>
            </div>
          </div>
        ) : filteredBoards.length === 0 ? (
          /* Empty search results state */
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No boards match &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery('')} className="mt-2 text-indigo-500 hover:text-indigo-600 text-sm font-medium">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBoards.map((board) => {
              const meta = boardMeta[board.id];
              return (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="board-card-premium group flex flex-col justify-between bg-white dark:bg-[#121214] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 cursor-pointer h-36 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm pr-6 line-clamp-2">{board.name}</h3>
                    <button 
                      onClick={(e) => handleDeleteClick(e, board.id, board.name)}
                      disabled={deleting && boardToDelete?.id === board.id}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Delete board"
                      aria-label="Delete board"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>

                  {/* Board metadata summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      {meta && (
                        <span className="flex items-center gap-1 font-medium">
                          <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                          {meta.columnCount} {meta.columnCount === 1 ? 'col' : 'cols'}
                        </span>
                      )}
                      <span className="font-medium">{relativeDate(board.created_at)}</span>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Open
                      <svg className="w-3 h-3 ml-1 opacity-70 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={!!boardToDelete}
        title="Delete Board"
        message={`Are you sure you want to delete the board "${boardToDelete?.name}"? This action cannot be undone and will delete all columns and cards inside it.`}
        confirmText="Delete Board"
        isDestructive={true}
        onConfirm={confirmDeleteBoard}
        onCancel={() => setBoardToDelete(null)}
      />
    </div>
  );
};