import { useCallback, useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Column } from '../components/board/Column';
import type { ColumnType } from '../components/board/Column';
import type { CardType } from '../components/board/Card';
import { CardModal } from '../components/board/CardModal';
const RetroModal = lazy(() => import('../components/board/RetroModal').then(m => ({ default: m.RetroModal })));
import {  useToast  } from '../hooks/useToast';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const Board = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [board, setBoard] = useState<{ name: string } | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // M7: Board title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isRetroModalOpen, setIsRetroModalOpen] = useState(false);
  const { toast } = useToast();

  // Derive user initial from email for the avatar
  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  // Capture URL search as a stable primitive for useCallback deps.
  // Invite tokens arrive via ?invite=... and are consumed once on first load.
  const locationSearch = location.search;

  const columnsRef = useRef<ColumnType[]>([]);
  const cardsRef = useRef<CardType[]>([]);
  const initialCardsSnapshot = useRef<CardType[]>([]); // M10: True rollback state

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBoardData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Check for invite token
      const searchParams = new URLSearchParams(locationSearch);
      const inviteToken = searchParams.get('invite');
      if (inviteToken) {
        const { error: joinError } = await supabase.rpc('join_board', {
          p_board_id: boardId,
          p_token: inviteToken
        });
        
        // Clean URL regardless of success/fail so we don't keep triggering it
        window.history.replaceState({}, '', `/board/${boardId}`);
        
        if (joinError) {
          toast({ title: 'Invalid invite', description: joinError.message, variant: 'error' });
        } else {
          toast({ title: 'Joined board!', description: 'You have been added as a member.', variant: 'success' });
        }
      }

      // 2. Fetch Board metadata
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('name')
        .eq('id', boardId)
        .single();

      // C4: Board not found or no access → redirect to dashboard
      if (boardError || !boardData) {
        toast({ title: 'Board not found', description: 'This board does not exist or you do not have access.', variant: 'error' });
        navigate('/dashboard', { replace: true });
        return;
      }
      setBoard(boardData);

      const { data: colsData } = await supabase.from('columns').select('*').eq('board_id', boardId).order('position');
      if (colsData) setColumns(colsData);

      if (colsData && colsData.length > 0) {
        const { data: cardsData } = await supabase.from('cards')
          .select('*')
          .in('column_id', colsData.map(c => c.id))
          .order('position');
        if (cardsData) setCards(cardsData);
      } else {
        setCards([]);
      }

    } catch (error) {
      // C7: Show error to the user, not just the console
      const message = error instanceof Error ? error.message : 'Failed to load board data';
      console.error('Error fetching board data:', error);
      toast({ title: 'Failed to load board', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [boardId, locationSearch, navigate, toast]);

  // Effect 1: Fetch board data when boardId or invite token changes
  useEffect(() => {
    if (boardId) fetchBoardData();
  }, [boardId, fetchBoardData]);

  // Effect 2: Real-time Sync — independent subscription lifecycle
  useEffect(() => {
    if (!boardId) return;

    const channel = supabase
      .channel(`board-${boardId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, payload => {
        const columnIds = columnsRef.current.map(c => c.id);

        if (payload.eventType === 'INSERT') {
          const newCard = payload.new as CardType;
          if (!columnIds.includes(newCard.column_id)) return;
          setCards(prev => {
            if (prev.find(c => c.id === newCard.id)) return prev;
            return [...prev, newCard];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedCard = payload.new as CardType;
          if (!columnIds.includes(updatedCard.column_id)) return;
          setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
        } else if (payload.eventType === 'DELETE') {
          const oldCardId = payload.old.id;
          const belongs = cardsRef.current.some(c => c.id === oldCardId);
          if (!belongs) return;
          setCards(prev => prev.filter(c => c.id !== oldCardId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` }, payload => {
        if (payload.eventType === 'INSERT') {
          setColumns(prev => {
            if (prev.find(c => c.id === payload.new.id)) return prev;
            return [...prev, payload.new as ColumnType];
          });
        } else if (payload.eventType === 'UPDATE') {
          setColumns(prev => prev.map(c => c.id === payload.new.id ? payload.new as ColumnType : c));
        } else if (payload.eventType === 'DELETE') {
          setColumns(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim() || !boardId) return;

    const newPos = columns.length;
    const tempId = crypto.randomUUID();
    const newCol = { id: tempId, board_id: boardId, name: newColumnName.trim(), position: newPos };
    setColumns(prev => [...prev, newCol]);
    setNewColumnName('');
    setIsAddingColumn(false);

    try {
      const { data, error } = await supabase.from('columns').insert({
        board_id: boardId,
        name: newCol.name,
        position: newPos
      }).select().single();

      if (error) throw error;

      if (data) {
        setColumns(prev => prev.map(c => c.id === tempId ? data : c));
        toast({ title: 'Column added', variant: 'success' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setColumns(prev => prev.filter(c => c.id !== tempId));
      setIsAddingColumn(true);
      setNewColumnName(newCol.name);
      toast({ title: 'Error adding column', description: message, variant: 'error' });
    }
  };

  const handleAddCard = async (columnId: string, title: string) => {
    const columnCards = cards.filter(c => c.column_id === columnId);
    const newPos = columnCards.length;

    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    // C5: Include all CardType fields so the temp card satisfies the full type (avoids runtime issues before DB responds)
    const newCard: CardType = {
      id: tempId,
      column_id: columnId,
      title,
      position: newPos,
      description: '',
      labels: [],
      due_date: undefined,
      created_at: now,
      updated_at: now,
    };
    setCards(prev => [...prev, newCard]);

    try {
      const { data, error } = await supabase.from('cards').insert({
        column_id: columnId,
        title,
        position: newPos
      }).select().single();

      if (error) throw error;

      if (data) {
        setCards(prev => prev.map(c => c.id === tempId ? data : c));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCards(prev => prev.filter(c => c.id !== tempId));
      toast({ title: 'Error adding card', description: message, variant: 'error' });
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    initialCardsSnapshot.current = cards; // M10: Snapshot before mutation
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    if (card) setActiveCard(card);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'Card';
    const isOverCard = over.data.current?.type === 'Card';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveCard) return;

    if (isActiveCard && isOverCard) {
      setCards((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        if (prev[activeIndex].column_id !== prev[overIndex].column_id) {
          const newCards = [...prev];
          newCards[activeIndex].column_id = prev[overIndex].column_id;
          return arrayMove(newCards, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    if (isActiveCard && isOverColumn) {
      setCards((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newCards = [...prev];
        newCards[activeIndex].column_id = overId as string;
        return arrayMove(newCards, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const originalCard = activeCard; // M10: Capture before clearing
    setActiveCard(null);
    const { active, over } = event;
    
    // M10: Revert optimistic updates if dropped outside
    if (!over) {
      setCards(initialCardsSnapshot.current);
      return;
    }

    const activeId = active.id as string;
    const activeCardData = cards.find(c => c.id === activeId);
    
    // M10: Glitch safety
    if (!activeCardData || !originalCard) {
      setCards(initialCardsSnapshot.current);
      return;
    }

    // M10: Read source column from pre-drag state, not mutated state
    const sourceColumnId = originalCard.column_id;

    let targetColumnId: string;
    const overCard = cards.find(c => c.id === over.id);
    if (overCard) {
      targetColumnId = overCard.column_id;
    } else {
      targetColumnId = over.id as string; // dropped on a column
    }

    // Recompute positions within each affected column and persist them
    const recomputePositions = (allCards: CardType[], columnId: string) => {
      return allCards
        .filter(c => c.column_id === columnId)
        .map((c, idx) => ({ id: c.id, position: idx }));
    };

    // Build a Set of all unique affected column ids
    const affectedColumnIds = new Set<string>([sourceColumnId, targetColumnId]);

    // Build the full list of updates: { id, position } for every card in affected columns
    // We use the CURRENT cards state (which has already been mutated by onDragOver's optimistic updates)
    const positionUpdates: { id: string; position: number; column_id: string }[] = [];
    for (const colId of affectedColumnIds) {
      const positions = recomputePositions(cards, colId);
      for (const p of positions) {
        positionUpdates.push({ ...p, column_id: colId });
      }
    }

    try {
      // Update each card individually via Promise.all
      const promises = positionUpdates.map(p =>
        supabase
          .from('cards')
          .update({ position: p.position, column_id: p.column_id })
          .eq('id', p.id)
      );
      const results = await Promise.all(promises);
      const anyError = results.find(r => r.error);
      if (anyError?.error) throw anyError.error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Drag operation failed:', message);
      toast({ title: 'Move failed', description: message, variant: 'error' });
      setCards(initialCardsSnapshot.current); // M10: Proper rollback
    }
  };

  if (loading) return (
    <div className="flex flex-col h-screen pt-[52px] bg-zinc-50 dark:bg-[#0c0c0d] overflow-hidden">
      {/* Skeleton header bar */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      {/* Skeleton columns */}
      <div className="flex gap-4 p-6 overflow-hidden">
        {[
          { cards: 3, widths: ['w-full', 'w-4/5', 'w-full'] },
          { cards: 2, widths: ['w-3/4', 'w-full'] },
          { cards: 3, widths: ['w-full', 'w-2/3', 'w-4/5'] },
        ].map((col, i) => (
          <div
            key={i}
            className="bg-zinc-100/80 dark:bg-[#121214] p-3 rounded-xl w-[280px] flex-shrink-0 border border-zinc-200 dark:border-zinc-800/80"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Column header skeleton */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-20 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                <div className="h-4 w-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
            {/* Card skeletons */}
            <div className="flex flex-col gap-2">
              {col.cards && col.widths.map((w, j) => (
                <div
                  key={j}
                  className={`bg-white dark:bg-[#18181b] rounded-lg p-3 border border-zinc-200 dark:border-zinc-800/80 animate-pulse`}
                  style={{ animationDelay: `${i * 80 + j * 60}ms` }}
                >
                  <div className={`h-3 ${w} bg-zinc-200 dark:bg-zinc-700 rounded mb-2`} />
                  {j % 2 === 0 && <div className="h-2.5 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // M7: save board title to DB
  const handleTitleSave = async () => {
    const trimmed = titleValue.trim();
    setIsEditingTitle(false);
    if (!trimmed || trimmed === board?.name) return;
    const { error } = await supabase.from('boards').update({ name: trimmed }).eq('id', boardId);
    if (error) {
      toast({ title: 'Could not rename board', description: error.message, variant: 'error' });
    } else {
      setBoard({ name: trimmed });
    }
  };

  return (
    <div className="flex flex-col h-screen pt-[52px] bg-zinc-50 dark:bg-[#0c0c0d] overflow-hidden">
      <div className="px-6 py-3 bg-zinc-50/50 dark:bg-[#0c0c0d]/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-10 flex justify-between items-center gap-4">
        {/* M8: Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm flex-shrink-0"
            aria-label="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline font-medium">Boards</span>
          </button>
          <span className="text-zinc-300 dark:text-zinc-700 text-sm flex-shrink-0">/</span>
          {/* M7: Click board title to edit */}
          {isEditingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') { setTitleValue(board?.name || ''); setIsEditingTitle(false); }
              }}
              className="text-xl font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none text-zinc-900 dark:text-zinc-100 tracking-tight min-w-0"
            />
          ) : (
            <h1
              className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
              onClick={() => { setTitleValue(board?.name || ''); setIsEditingTitle(true); }}
              title="Click to rename"
            >
              {board?.name || 'Board'}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Collaborator avatar — shows the logged-in user's initial */}
          <div className="hidden sm:flex items-center">
            <div className="flex -space-x-2">
              <div
                className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white dark:border-[#0c0c0d] flex items-center justify-center text-[10px] font-bold text-white"
                title={user?.email ?? 'You'}
              >
                {userInitial}
              </div>
            </div>
            <button 
              onClick={async () => {
                const { data: token, error } = await supabase.rpc('generate_invite_token', { p_board_id: boardId });
                if (error) {
                  toast({ title: 'Cannot create invite', description: error.message, variant: 'error' });
                  return;
                }
                const inviteUrl = `${window.location.origin}/board/${boardId}?invite=${token}`;
                navigator.clipboard.writeText(inviteUrl);
                toast({ title: 'Invite link copied!', description: 'Anyone with this link can join your board.', variant: 'success' });
              }}
              className="ml-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors bg-zinc-200/50 dark:bg-zinc-800/50 px-2 py-1 rounded active:scale-95"
            >
              Share
            </button>
          </div>

          <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-800 hidden sm:block"></div>

          {/* P2: AI Retro Premium Button */}
          <button
            onClick={() => setIsRetroModalOpen(true)}
            className="group relative flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md transition-all overflow-hidden flex-shrink-0"
            aria-label="Open AI Retrospective"
          >
            {/* Subtle animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20 group-hover:opacity-40 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />
            <svg className="w-4 h-4 text-indigo-400 dark:text-indigo-600 relative z-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span className="relative z-10">AI Retro</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 items-start h-full pb-8">
            {columns.map(col => (
              <Column 
                key={col.id} 
                column={col} 
                cards={cards.filter(c => c.column_id === col.id).sort((a, b) => a.position - b.position)} 
                onAddCard={handleAddCard}
                onCardClick={(card) => setSelectedCard(card)}
                onDelete={(id) => setColumns(prev => prev.filter(c => c.id !== id))}
                onRename={(id, name) => setColumns(prev => prev.map(c => c.id === id ? { ...c, name } : c))}
              />
            ))}
            
            {/* Add Column Button */}
            <div className="bg-zinc-50/50 dark:bg-[#121214] p-3 rounded-xl w-[280px] flex-shrink-0 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              {isAddingColumn ? (
                <form onSubmit={handleAddColumn} className="flex flex-col gap-2">
                  <input
                    type="text"
                    autoFocus
                    aria-label="New column title"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column title..."
                    className="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-zinc-900 dark:text-white"
                  />
                  <div className="flex gap-2 items-center">
                    <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-md transition-colors">Add</button>
                    <button type="button" onClick={() => setIsAddingColumn(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 text-xs font-medium px-2">Cancel</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 text-sm font-medium flex items-center justify-center gap-2 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add column
                </button>
              )}
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <div className="bg-white dark:bg-[#18181b] p-3 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 opacity-90 cursor-grabbing rotate-2 transition-transform">
                <div className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{activeCard.title}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={(updatedCard) => {
            setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
            setSelectedCard(updatedCard);
          }}
          onDelete={(id) => {
            setCards(prev => prev.filter(c => c.id !== id));
            setSelectedCard(null);
          }}
        />
      )}

      {isRetroModalOpen && boardId && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        }>
          <RetroModal
            boardId={boardId}
            onClose={() => setIsRetroModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
