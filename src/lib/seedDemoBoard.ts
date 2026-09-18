import { supabase } from './supabaseClient';
import { LABEL_CONFIG } from './labelConfig';

export interface SeedBoardResult {
  boardId: string;
  name: string;
  isExisting?: boolean;
}

/**
 * Creates a clean, realistic engineering demo board for the authenticated user.
 * Avoids personal data and demonstrates real-world product/engineering tasks.
 * If a demo board already exists for this user, it returns the existing board to prevent duplicates.
 */
export async function seedDemoBoard(): Promise<SeedBoardResult> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('You must be signed in to create a demo board.');
  }

  const userId = userData.user.id;
  const boardName = 'Sprint 14 — Core Platform & AI Flow';

  // 0. Check if demo board already exists for this user
  const { data: existingBoard } = await supabase
    .from('boards')
    .select('id, name')
    .eq('name', boardName)
    .eq('created_by', userId)
    .maybeSingle();

  if (existingBoard) {
    // Migrate any legacy lowercase labels on existing demo board so they render with full color coding
    try {
      const { data: cols } = await supabase
        .from('columns')
        .select('id')
        .eq('board_id', existingBoard.id);
      if (cols && cols.length > 0) {
        const colIds = cols.map(c => c.id);
        const { data: existingCards } = await supabase
          .from('cards')
          .select('id, labels')
          .in('column_id', colIds);
        if (existingCards) {
          for (const card of existingCards) {
            if (card.labels && card.labels.length > 0) {
              const updated = card.labels.map((l: string) => {
                const found = Object.keys(LABEL_CONFIG).find(k => k.toLowerCase() === l.toLowerCase());
                return found || l;
              });
              if (JSON.stringify(updated) !== JSON.stringify(card.labels)) {
                await supabase.from('cards').update({ labels: updated }).eq('id', card.id);
              }
            }
          }
        }
      }
    } catch {
      // Non-blocking fallback; getLabelConfig case-insensitivity also resolves on display
    }

    return {
      boardId: existingBoard.id,
      name: existingBoard.name,
      isExisting: true,
    };
  }

  const boardId = crypto.randomUUID();

  // 1. Create Board
  const { error: boardError } = await supabase
    .from('boards')
    .insert([{ id: boardId, name: boardName, created_by: userId }]);

  if (boardError) throw boardError;

  // 2. Add as Owner
  const { error: memberError } = await supabase
    .from('board_members')
    .insert([{ board_id: boardId, user_id: userId, role: 'owner' }]);

  if (memberError) throw memberError;

  // 3. Create Standard Columns
  const columnsData = [
    { id: crypto.randomUUID(), board_id: boardId, name: 'Backlog', position: 0 },
    { id: crypto.randomUUID(), board_id: boardId, name: 'In Progress', position: 1 },
    { id: crypto.randomUUID(), board_id: boardId, name: 'Review', position: 2 },
    { id: crypto.randomUUID(), board_id: boardId, name: 'Done', position: 3 },
  ];

  const { error: colError } = await supabase.from('columns').insert(columnsData);
  if (colError) throw colError;

  const [colBacklog, colInProgress, colReview, colDone] = columnsData;
  const now = new Date();

  const addDays = (d: number) => {
    const res = new Date(now);
    res.setDate(res.getDate() + d);
    return res.toISOString();
  };

  const subDays = (d: number) => {
    const res = new Date(now);
    res.setDate(res.getDate() - d);
    return res.toISOString();
  };

  // 4. Create Realistic Tasks
  const cardsData = [
    // Backlog
    {
      id: crypto.randomUUID(),
      column_id: colBacklog.id,
      title: 'Design empty-state illustrations',
      description: 'Create clean SVG empty states for zero-board dashboard and empty retro reports to enhance onboarding.',
      position: 0,
      labels: ['Design', 'Feature'],
      due_date: addDays(5),
      created_at: subDays(2),
      updated_at: subDays(2),
    },
    {
      id: crypto.randomUUID(),
      column_id: colBacklog.id,
      title: 'Write onboarding tour copy',
      description: 'Draft step-by-step tooltip guide copy highlighting real-time cursor sync and AI retro generation.',
      position: 1,
      labels: ['Documentation', 'Enhancement'],
      due_date: addDays(7),
      created_at: subDays(2),
      updated_at: subDays(2),
    },
    {
      id: crypto.randomUUID(),
      column_id: colBacklog.id,
      title: 'Audit mobile touch targets',
      description: 'Verify all clickable header elements and column action buttons meet the WCAG 44x44px minimum touch target size.',
      position: 2,
      labels: ['Enhancement'],
      due_date: addDays(10),
      created_at: subDays(1),
      updated_at: subDays(1),
    },
    // In Progress
    {
      id: crypto.randomUUID(),
      column_id: colInProgress.id,
      title: 'Fix Safari drag ghost image',
      description: 'Resolve Safari WebKit ghost-drag opacity bug during rapid multi-touch card repositioning.',
      position: 0,
      labels: ['Bug'],
      due_date: addDays(1),
      created_at: subDays(4),
      updated_at: subDays(4), // intentionally older to showcase bottleneck detection
    },
    {
      id: crypto.randomUUID(),
      column_id: colInProgress.id,
      title: 'Add rate limiting to retro endpoint',
      description: 'Implement 5-second client-side throttle cooldown and Edge Function token rate-limiting to prevent Groq API abuse.',
      position: 1,
      labels: ['Feature', 'Security'],
      due_date: addDays(2),
      created_at: subDays(3),
      updated_at: subDays(3),
    },
    {
      id: crypto.randomUUID(),
      column_id: colInProgress.id,
      title: 'Optimize card reorder latency',
      description: 'Batch optimistic array reordering before broadcasting PostgreSQL change events via Supabase WebSockets.',
      position: 2,
      labels: ['Performance', 'Enhancement'],
      due_date: addDays(3),
      created_at: subDays(2),
      updated_at: subDays(2),
    },
    // Review
    {
      id: crypto.randomUUID(),
      column_id: colReview.id,
      title: 'Design system token migration',
      description: 'Migrate ad-hoc hex colors across modals and inputs into standardized Tailwind CSS color variables.',
      position: 0,
      labels: ['Design', 'Enhancement'],
      due_date: addDays(1),
      created_at: subDays(3),
      updated_at: subDays(1),
    },
    {
      id: crypto.randomUUID(),
      column_id: colReview.id,
      title: 'Supabase edge function error logging',
      description: 'Add structured JSON logging with request IDs to the generate-retro Deno function.',
      position: 1,
      labels: ['Feature'],
      due_date: addDays(2),
      created_at: subDays(2),
      updated_at: subDays(1),
    },
    // Done
    {
      id: crypto.randomUUID(),
      column_id: colDone.id,
      title: 'Implement dark mode theme switch',
      description: 'Added unified dark mode toggle with CSS variable syncing across navbar, canvas, and modals.',
      position: 0,
      labels: ['Feature', 'Design'],
      due_date: subDays(1),
      created_at: subDays(5),
      updated_at: subDays(1),
    },
    {
      id: crypto.randomUUID(),
      column_id: colDone.id,
      title: 'Set up Vitest testing suite',
      description: 'Integrated Vitest, JSDOM, and Testing Library with unit tests for board logic, auth guards, and AI retros.',
      position: 1,
      labels: ['Testing'],
      due_date: subDays(2),
      created_at: subDays(4),
      updated_at: subDays(2),
    },
    {
      id: crypto.randomUUID(),
      column_id: colDone.id,
      title: 'Add optimistic UI card drop',
      description: 'Instant local DOM updates during dnd-kit drop events to eliminate perceived network roundtrip lag.',
      position: 2,
      labels: ['Feature', 'Performance'],
      due_date: subDays(3),
      created_at: subDays(6),
      updated_at: subDays(2),
    },
  ];

  const { error: cardsError } = await supabase.from('cards').insert(cardsData);
  if (cardsError) throw cardsError;

  // 5. Seed a sample retrospective
  const retroContent = `# Sprint 14 Retrospective — Core Platform & AI Flow

### 🚀 What Went Well
- **Dark Mode & Design System**: Successfully implemented full dark mode support across the entire interface without layout shift.
- **Optimistic UI**: Card drag-and-drop latency dropped below 16ms locally, providing instant tactile feedback.
- **Automated Test Coverage**: Vitest suite established with 100% pass rate covering board calculations and auth guards.

### ⚠️ Bottlenecks & Stuck Items
- **Safari Drag Ghost Image**: Lingered in *In Progress* for 4+ days due to WebKit-specific touch event quirks.
- **Retro Endpoint Cooldown**: Needed client-side rate limiting to prevent accidental double-submits.

### 🎯 Action Plan for Sprint 15
1. Enforce a Work-In-Progress (WIP) limit of 2 items on the *In Progress* column.
2. Finalize token rate-limiting on the Groq API edge function.
3. Complete empty-state illustrations for zero-data views.`;

  await supabase.from('retros').insert([{ board_id: boardId, content: retroContent }]);

  return { boardId, name: boardName };
}
