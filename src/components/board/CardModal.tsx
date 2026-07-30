import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CardType } from './Card';
import { useToast } from '../toast';
import { ConfirmDialog } from '../ConfirmDialog';

type CardModalProps = {
  card: CardType;
  onClose: () => void;
  onUpdate: (updatedCard: CardType) => void;
  onDelete: (id: string) => void;
};

const PREDEFINED_LABELS = ['Bug', 'Feature', 'Enhancement', 'High Priority', 'Design', 'Backend', 'Frontend'];

export const CardModal = ({ card, onClose, onUpdate, onDelete }: CardModalProps) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState<string[]>(card.labels || []);
  const [dueDate, setDueDate] = useState<string>(card.due_date ? card.due_date.split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    
    const updateData: any = { 
      title: title.trim(), 
      description: description.trim(),
      labels: labels
    };
    
    if (dueDate) {
      updateData.due_date = new Date(dueDate).toISOString();
    } else {
      updateData.due_date = null;
    }
    
    const { data, error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', card.id)
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      onUpdate(data);
      onClose();
    } else {
      toast({ title: 'Error saving card', description: error.message, variant: 'error' });
    }
  };

  const performDelete = async () => {
    setSaving(true);
    const { error } = await supabase.from('cards').delete().eq('id', card.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error deleting card', description: error.message, variant: 'error' });
    } else {
      toast({ title: 'Card deleted', variant: 'success' });
      onDelete(card.id);
      onClose();
    }
  };

  const toggleLabel = (label: string) => {
    if (labels.includes(label)) {
      setLabels(labels.filter(l => l !== label));
    } else {
      setLabels([...labels, label]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div 
        className="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            ID-{card.id.slice(0, 5)}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col md:flex-row gap-8">
          
          {/* Left Column (Main content) */}
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-900 dark:text-zinc-100 mb-6 placeholder-zinc-400 p-0"
              placeholder="Card title..."
            />
            
            <div className="mb-6">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="w-full min-h-[150px] p-3 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 rounded-lg focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-sm text-zinc-800 dark:text-zinc-300 custom-scrollbar resize-y transition-colors placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Right Column (Sidebar attributes) */}
          <div className="w-full md:w-48 flex flex-col gap-6 shrink-0">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">Due Date</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-800 dark:text-zinc-300 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">Labels</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_LABELS.map(label => {
                  const isActive = labels.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-2.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-md transition-colors border ${
                        isActive 
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' 
                        : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 py-4 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between gap-3">
          <button onClick={() => setIsConfirmOpen(true)} disabled={saving} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
            Delete Card
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-md transition-colors disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete Card"
        isDestructive={true}
        onConfirm={performDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
