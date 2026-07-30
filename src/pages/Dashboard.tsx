// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

type Board = {
  id: string;
  name: string;
  created_at: string;
};

export const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
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
      setBoards(data || []);
    } catch (err: any) {
      setError(err.message);
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

      // Create board
      const { error: boardError } = await supabase
        .from('boards')
        .insert([{ id: newBoardId, name: newBoardName.trim(), created_by: userData.user.id }]);

      if (boardError) throw boardError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('board_members')
        .insert([{ board_id: newBoardId, user_id: userData.user.id, role: 'owner' }]);

      if (memberError) throw memberError;

      setNewBoardName('');
      navigate(`/board/${newBoardId}`);
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      toast({ title: 'Error deleting board', description: err.message, variant: 'error' });
    } finally {
      setDeleting(false);
      setBoardToDelete(null);
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-[1400px] mx-auto min-h-screen animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
          Projects
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your boards and workflows.
        </p>
      </div>
      
      <div className="mb-12">
        <form onSubmit={createBoard} className="flex flex-col sm:flex-row gap-3 items-start">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New board name..."
            className="w-full sm:w-80 px-3 py-2 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {creating ? 'Creating...' : 'Create board'}
          </button>
        </form>
        {error && <div className="mt-3 text-red-500 text-sm font-medium">{error}</div>}
      </div>

      <div>
        {loading ? (
          <div className="flex gap-4 flex-wrap">
            {[1,2,3].map(i => (
              <div key={i} className="w-full md:w-[calc(33.333%-1rem)] h-32 bg-zinc-200 dark:bg-zinc-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No boards yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="group flex flex-col justify-between bg-white dark:bg-[#121214] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 cursor-pointer transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 h-32 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm pr-6">{board.name}</h3>
                  <button 
                    onClick={(e) => handleDeleteClick(e, board.id, board.name)}
                    disabled={deleting && boardToDelete?.id === board.id}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete board"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                <div className="flex items-center text-xs font-medium text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                  Open board
                  <svg className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            ))}
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