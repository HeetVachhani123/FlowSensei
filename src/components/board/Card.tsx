import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type CardType = {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  position: number;
  labels?: string[];
  due_date?: string;
  created_at?: string;
  updated_at?: string;
};

type CardProps = {
  card: CardType;
  onClick: (card: CardType) => void;
};

export const Card = ({ card, onClick }: CardProps) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(card)}
      className={`card
        bg-white dark:bg-[#18181b] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80
        mb-2 cursor-pointer active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-600 transition-all
        ${isDragging ? 'opacity-50 ring-1 ring-zinc-400 dark:ring-zinc-600 shadow-xl' : ''}
      `}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {card.labels.map(label => (
            <span key={label} className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="font-medium text-sm text-zinc-800 dark:text-zinc-200 leading-snug">{card.title}</div>
      
      {(card.description || card.due_date) && (
        <div className="mt-2.5 flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
          {card.description && (
            <div className="flex items-center gap-1" title="Has description">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            </div>
          )}
          {card.due_date && (
            <div 
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isOverdue 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`} 
              title={isOverdue ? 'Overdue' : 'Due date'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
