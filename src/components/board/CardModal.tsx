import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CardType } from './Card';
import {  useToast  } from '../../hooks/useToast';
import { ConfirmDialog } from '../ConfirmDialog';
import { LABEL_CONFIG, PREDEFINED_LABELS } from '../../lib/labelConfig';

type CardModalProps = {
  card: CardType;
  onClose: () => void;
  onUpdate: (updatedCard: CardType) => void;
  onDelete: (id: string) => void;
};

export const CardModal = ({ card, onClose, onUpdate, onDelete }: CardModalProps) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState<string[]>(card.labels || []);
  const [dueDate, setDueDate] = useState<string>(card.due_date ? card.due_date.split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);   // M20: separate delete state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const { toast } = useToast();

  // M4: Track unsaved changes
  const originalDueDate = card.due_date ? card.due_date.split('T')[0] : '';
  const isDirty = useMemo(() =>
    title !== card.title ||
    description !== (card.description || '') ||
    JSON.stringify(labels.slice().sort()) !== JSON.stringify((card.labels || []).slice().sort()) ||
    dueDate !== originalDueDate,
    [title, description, labels, dueDate, card, originalDueDate]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // M4: Warn on Escape if there are unsaved changes
      if (e.key === 'Escape') {
        if (isDirty) {
          setIsDiscardConfirmOpen(true);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDirty]);

  // M4: Intercept backdrop click too
  const handleBackdropClick = () => {
    if (isDirty) {
      setIsDiscardConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    type CardUpdatePayload = {
      title: string;
      description: string;
      labels: string[];
      due_date: string | null;
    };
    
    const updateData: CardUpdatePayload = { 
      title: title.trim(), 
      description: description.trim(),
      labels: labels,
      due_date: null
    };
    
    if (dueDate) {
      // Parse as LOCAL date to avoid UTC-midnight off-by-one-day in UTC+ timezones (e.g. IST = UTC+5:30)
      const [y, m, d] = dueDate.split('-').map(Number);
      updateData.due_date = new Date(y, m - 1, d, 23, 59, 59).toISOString();
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
      toast({ title: 'Error saving card', description: error?.message || 'Unknown error', variant: 'error' });
    }
  };

  const performDelete = async () => {
    // M20: Use separate isDeleting state — doesn't block the Save button
    setIsDeleting(true);
    const { error } = await supabase.from('cards').delete().eq('id', card.id);
    setIsDeleting(false);
    if (error) {
      toast({ title: 'Error deleting card', description: error?.message || 'Unknown error', variant: 'error' });
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in-up"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
              ID-{card.id.slice(0, 5)}
            </div>
            {/* M4: Dirty indicator dot */}
            {isDirty && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Unsaved
              </span>
            )}
          </div>
          <button
            onClick={handleBackdropClick}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="Close modal"
          >
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
                className="w-full text-sm px-3 py-2 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-300 transition-colors"
              />
            </div>

            {/* P3: Color-coded labels */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_LABELS.map(label => {
                  const isActive = labels.includes(label);
                  const cfg = LABEL_CONFIG[label];
                  return (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-2.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-md transition-all border ${
                        isActive
                          ? `${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder} shadow-sm`
                          : `${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`
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
          {/* M20: Delete button uses separate isDeleting state */}
          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Card'}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleBackdropClick}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium rounded-md transition-all disabled:opacity-40 shadow-sm"
            >
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

      {/* M4: Discard unsaved changes confirmation */}
      <ConfirmDialog
        isOpen={isDiscardConfirmOpen}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard"
        cancelText="Keep editing"
        isDestructive={true}
        onConfirm={() => { setIsDiscardConfirmOpen(false); onClose(); }}
        onCancel={() => setIsDiscardConfirmOpen(false)}
      />
    </div>
  );
};
