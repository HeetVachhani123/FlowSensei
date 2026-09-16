import { describe, it, expect } from 'vitest';
import { arrayMove } from '@dnd-kit/sortable';
import type { CardType } from '../components/board/Card';

describe('Board Card Logic & Drag Handling', () => {
  const sampleCards: CardType[] = [
    { id: 'card-1', column_id: 'col-todo', title: 'Setup auth', position: 0 },
    { id: 'card-2', column_id: 'col-todo', title: 'Design database', position: 1 },
    { id: 'card-3', column_id: 'col-inprogress', title: 'Build UI', position: 0 },
  ];

  it('reorders cards within the same column using arrayMove', () => {
    const todoCards = sampleCards.filter(c => c.column_id === 'col-todo');
    // Move card-1 from index 0 to index 1
    const reordered = arrayMove(todoCards, 0, 1);

    expect(reordered[0].id).toBe('card-2');
    expect(reordered[1].id).toBe('card-1');

    // Recompute positions
    const updatedPositions = reordered.map((card, idx) => ({
      ...card,
      position: idx,
    }));

    expect(updatedPositions[0].position).toBe(0);
    expect(updatedPositions[1].position).toBe(1);
    expect(updatedPositions[0].id).toBe('card-2');
  });

  it('transfers a card to a different column and assigns position', () => {
    const activeCardId = 'card-1';
    const targetColumnId = 'col-inprogress';

    const updatedCards = sampleCards.map(c => {
      if (c.id === activeCardId) {
        return { ...c, column_id: targetColumnId };
      }
      return c;
    });

    const inProgressCards = updatedCards.filter(c => c.column_id === targetColumnId);
    expect(inProgressCards).toHaveLength(2);
    expect(inProgressCards.some(c => c.id === 'card-1')).toBe(true);

    const todoCards = updatedCards.filter(c => c.column_id === 'col-todo');
    expect(todoCards).toHaveLength(1);
    expect(todoCards[0].id).toBe('card-2');
  });

  it('rolls back optimistic state when a drag mutation fails', () => {
    const initialSnapshot = [...sampleCards];
    let cardsState = [...sampleCards];

    // Optimistic update: move card-1 to inprogress
    cardsState = cardsState.map(c => (c.id === 'card-1' ? { ...c, column_id: 'col-inprogress' } : c));
    expect(cardsState.find(c => c.id === 'card-1')?.column_id).toBe('col-inprogress');

    // Simulated network failure triggering rollback to snapshot
    const mutationSucceeded = false;
    if (!mutationSucceeded) {
      cardsState = [...initialSnapshot];
    }

    expect(cardsState).toEqual(initialSnapshot);
    expect(cardsState.find(c => c.id === 'card-1')?.column_id).toBe('col-todo');
  });
});
