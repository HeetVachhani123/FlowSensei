import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Column } from '../components/board/Column';
import type { ColumnType } from '../components/board/Column';
import type { CardType } from '../components/board/Card';
import { CardModal } from '../components/board/CardModal';
import { RetroModal } from '../components/board/RetroModal';
import { useToast } from '../components/toast';
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
  const [board, setBoard] = useState<{ name: string } | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isRetroModalOpen, setIsRetroModalOpen] = useState(false);
  const { toast } = useToast();

  const columnsRef = useRef<ColumnType[]>([]);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

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

  useEffect(() => {
    if (boardId) {
      fetchBoardData();

      // Real-time Sync with Supabase Subscriptions
      const channel = supabase
        .channel(`board-${boardId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, payload => {
          if (payload.eventType === 'INSERT') {
            const newCard = payload.new as CardType;
            if (!columnsRef.current.some(c => c.id === newCard.column_id)) return;
            setCards(prev => {
              if (prev.find(c => c.id === newCard.id)) return prev;
              return [...prev, newCard];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedCard = payload.new as CardType;
            if (!columnsRef.current.some(c => c.id === updatedCard.column_id)) return;
            setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
          } else if (payload.eventType === 'DELETE') {
            setCards(prev => prev.filter(c => c.id !== payload.old.id));
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
    }
  }, [boardId]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const { data: boardData } = await supabase.from('boards').select('name').eq('id', boardId).single();
      if (boardData) setBoard(boardData);

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
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim() || !boardId) return;

    const newPos = columns.length;
    // Optimistic update
    const tempId = crypto.randomUUID();
    const newCol = { id: tempId, board_id: boardId, name: newColumnName.trim(), position: newPos };
    setColumns(prev => [...prev, newCol]);
    setNewColumnName('');
    setIsAddingColumn(false);

    const { data, error } = await supabase.from('columns').insert({
      board_id: boardId,
      name: newCol.name,
      position: newPos
    }).select().single();

    if (!error && data) {
      setColumns(prev => prev.map(c => c.id === tempId ? data : c));
    }
  };

  const handleAddCard = async (columnId: string, title: string) => {
    const columnCards = cards.filter(c => c.column_id === columnId);
    const newPos = columnCards.length;

    // Optimistic update
    const tempId = crypto.randomUUID();
    const newCard = { id: tempId, column_id: columnId, title, position: newPos };
    setCards(prev => [...prev, newCard]);

    const { data, error } = await supabase.from('cards').insert({
      column_id: columnId,
      title,
      position: newPos
    }).select().single();

    if (!error && data) {
      setCards(prev => prev.map(c => c.id === tempId ? data : c));
    }
  };

  const onDragStart = (event: DragStartEvent) => {
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
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeCardData = cards.find(c => c.id === activeId);
    if (!activeCardData) return;

    // Cache previous state for rollback
    const previousCards = [...cards];

    const columnCards = cards.filter(c => c.column_id === activeCardData.column_id);
    const newPositionIndex = columnCards.findIndex(c => c.id === activeId);
    
    // Save to Supabase (Background)
    const { error } = await supabase.from('cards').update({
      column_id: activeCardData.column_id,
      position: newPositionIndex
    }).eq('id', activeId);

    if (error) {
      console.error('Drag operation failed:', error);
      toast({ title: 'Move failed', description: error.message, variant: 'error' });
      // Rollback optimistic update
      setCards(previousCards);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen pt-16 bg-zinc-50 dark:bg-[#0c0c0d]">
      <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen pt-[52px] bg-zinc-50 dark:bg-[#0c0c0d] overflow-hidden">
      <div className="px-6 py-4 bg-zinc-50/50 dark:bg-[#0c0c0d]/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{board?.name || 'Board'}</h1>
        
        <button
          onClick={() => setIsRetroModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          AI Retro
        </button>
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
              />
            ))}
            
            {/* Add Column Button */}
            <div className="bg-zinc-50/50 dark:bg-[#121214] p-3 rounded-xl w-[280px] flex-shrink-0 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              {isAddingColumn ? (
                <form onSubmit={handleAddColumn} className="flex flex-col gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column title..."
                    className="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm text-zinc-900 dark:text-white"
                  />
                  <div className="flex gap-2 items-center">
                    <button type="submit" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 text-xs font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Add</button>
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
        <RetroModal
          boardId={boardId}
          onClose={() => setIsRetroModalOpen(false)}
        />
      )}
    </div>
  );
};
