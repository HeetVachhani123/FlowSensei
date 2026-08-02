// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {  useToast  } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ConfirmDialog';

type Board = {
  id: string;
  name: string;
  created_at: string;
};

// M10: column counts per board
type BoardMeta = {
  columnCount: number;
};

export const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardMeta, setBoardMeta] = useState<Record<string, BoardMeta>>({});
  const [newBoardName, setNewBoardName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');   // M9: search state
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

      // M10: Fetch column counts for all boards in one query
      if (loadedBoards.length > 0) {
        const { data: colData } = await supabase
          .from('columns')
          .select('board_id')
          .in('board_id', loadedBoards.map(b => b.id));

        const counts: Record<string, BoardMeta> = {};
        loadedBoards.forEach(b => { counts[b.id] = { columnCount: 0 }; });
        (colData || []).forEach(c => {
          if (counts[c.board_id]) counts[c.board_id].columnCount++;
        });
        setBoardMeta(counts);
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

      setNewBoardName('');
      navigate(`/board/${newBoardId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setCreating(false);
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

  // M9: Filtered boards based on search
  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // M10: Relative date formatter
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
    <div className="pt-24 pb-12 px-6 max-w-[1400px] mx-auto min-h-screen animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
          Projects {!loading && boards.length > 0 && (
            <span className="text-lg font-medium text-zinc-400 dark:text-zinc-600">({boards.length})</span>
          )}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your boards and workflows.
        </p>
      </div>
      
      {/* Create board + Search row */}
      <div className="mb-12 flex flex-col sm:flex-row gap-3 items-start">
        <form onSubmit={createBoard} className="flex flex-col sm:flex-row gap-3 items-start">
          <input
            type="text"
            aria-label="New board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New board name..."
            className="w-full sm:w-64 px-3 py-2 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-all shadow-sm hover:shadow-indigo-500/25 hover:shadow-md whitespace-nowrap"
          >
            {creating ? 'Creating...' : 'Create board'}
          </button>
        </form>

        {/* M9: Search bar */}
        {boards.length > 2 && (
          <div className="relative sm:ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              aria-label="Search boards"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="pl-9 pr-3 py-2 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 w-48"
            />
          </div>
        )}
        {error && <div className="mt-1 text-red-500 text-sm font-medium">{error}</div>}
      </div>

      <div>
        {loading ? (
          <div className="flex gap-4 flex-wrap">
            {[1,2,3].map(i => (
              <div key={i} className="w-full md:w-[calc(33.333%-1rem)] h-32 bg-zinc-200 dark:bg-zinc-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredBoards.length === 0 && boards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
            <svg className="w-20 h-20 mx-auto mb-6 text-zinc-300 dark:text-zinc-700" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="12" width="20" height="56" rx="4" fill="currentColor" opacity="0.5"/>
              <rect x="30" y="12" width="20" height="38" rx="4" fill="currentColor" opacity="0.7"/>
              <rect x="56" y="12" width="20" height="24" rx="4" fill="currentColor" opacity="0.4"/>
              <rect x="8" y="16" width="12" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="8" y="25" width="12" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="8" y="34" width="12" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="34" y="16" width="12" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="34" y="25" width="12" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="60" y="16" width="12" height="6" rx="2" fill="white" opacity="0.6"/>
              <circle cx="40" cy="72" r="4" fill="#6366f1" opacity="0.6"/>
            </svg>
            <p className="text-zinc-800 dark:text-zinc-200 font-semibold text-base mb-2">Your canvas is empty</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
              The journey of a thousand miles begins with a single board. Create one above to get started.
            </p>
          </div>
        ) : filteredBoards.length === 0 ? (
          // M9: No search results
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
                      className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete board"
                      aria-label="Delete board"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>

                  {/* M10: Board metadata row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-600">
                      {meta && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                          {meta.columnCount} {meta.columnCount === 1 ? 'column' : 'columns'}
                        </span>
                      )}
                      <span>{relativeDate(board.created_at)}</span>
                    </div>
                    <div className="flex items-center text-xs font-medium text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      Open
                      <svg className="w-3 h-3 ml-1 opacity-50 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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