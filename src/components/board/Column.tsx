import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { Card } from './Card';
import type { CardType } from './Card';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../toast';
import { ConfirmDialog } from '../ConfirmDialog';

export type ColumnType = {
  id: string;
  board_id: string;
  name: string;
  position: number;
};

type ColumnProps = {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string, title: string) => void;
  onCardClick: (card: CardType) => void;
  onDelete: (columnId: string) => void;
};

export const Column = ({ column, cards, onAddCard, onCardClick, onDelete }: ColumnProps) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  const handleDeleteColumn = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from('columns').delete().eq('id', column.id);
    setIsDeleting(false);
    
    if (error) {
      console.error('Delete column error:', error);
      toast({ title: 'Error deleting column', description: error.message, variant: 'error' });
    } else {
      toast({ title: 'Column deleted', variant: 'success' });
      onDelete(column.id);
    }
    // Supabase realtime subscription in Board.tsx will automatically remove it from UI
  };

  return (
    <div 
      ref={setNodeRef}
      className={`bg-zinc-50/50 dark:bg-[#121214] p-3 rounded-xl w-[280px] flex-shrink-0 flex flex-col max-h-full border border-zinc-200 dark:border-zinc-800/80 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex justify-between items-center mb-3 px-1 group">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{column.name}</h3>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded">
            {cards.length}
          </div>
        </div>
        <button 
          onClick={() => setIsConfirmOpen(true)}
          disabled={isDeleting}
          className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          title="Delete column"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-[150px] custom-scrollbar pr-1">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <Card key={card.id} card={card} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-1 pt-1">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Task title..."
              className="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-white placeholder-zinc-400 resize-none"
              rows={2}
            />
            <div className="flex gap-2 items-center">
              <button type="submit" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 text-xs font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Add</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-zinc-500 dark:text-zinc-400 text-xs hover:text-zinc-900 dark:hover:text-zinc-100 font-medium px-2 transition-colors">Cancel</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 px-2 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add card
          </button>
        )}
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Column"
        message={`Are you sure you want to delete the column "${column.name}" and all its cards? This action cannot be undone.`}
        confirmText="Delete Column"
        isDestructive={true}
        onConfirm={handleDeleteColumn}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
