import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LABEL_CONFIG } from '../../lib/labelConfig';

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
  isStuck?: boolean;
};

export const Card = ({ card, onClick, isStuck }: CardProps) => {
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
      role="button"
      tabIndex={0}
      aria-label={`Task: ${card.title}`}
      onClick={() => onClick(card)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(card);
        }
      }}
      className={`card
        bg-white dark:bg-[#18181b] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80
        mb-2 cursor-pointer active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-[0.99] select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        ${isDragging ? 'opacity-50 ring-1 ring-zinc-400 dark:ring-zinc-600 shadow-xl' : ''}
        ${isStuck ? 'border-l-4 border-l-amber-500 dark:border-l-amber-500' : ''}
      `}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map(label => {
            const cfg = LABEL_CONFIG[label];
            return cfg ? (
              <span
                key={label}
                className={`px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wide uppercase rounded border ${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder}`}
              >
                {label}
              </span>
            ) : (
              // Fallback for any unknown/custom label
              <span key={label} className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wide uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                {label}
              </span>
            );
          })}
        </div>
      )}

      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 leading-snug">{card.title}</div>
      
      {(card.description || card.due_date || isStuck) && (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            {card.description && (
              <div className="flex items-center gap-1" title="Has description">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              </div>
            )}
            {card.due_date && (
              <div 
                className={`flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isOverdue 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800' 
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60'
                }`} 
                title={isOverdue ? 'Overdue' : 'Due date'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>

          {isStuck && (
            <div 
              className="flex items-center gap-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 ml-auto flex-shrink-0 cursor-help"
              title="Card dwelling in column longer than 1.5x average"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span>STUCK</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
