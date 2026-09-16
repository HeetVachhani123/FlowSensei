-- FlowSensei Realistic Demo Board Seed
-- Run this in your Supabase SQL Editor to create a clean, public-ready engineering demo board

do $$
declare
  v_user_id uuid;
  v_board_id uuid := 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid;
  v_col_backlog uuid := gen_random_uuid();
  v_col_inprogress uuid := gen_random_uuid();
  v_col_review uuid := gen_random_uuid();
  v_col_done uuid := gen_random_uuid();
begin
  -- Get the current authenticated user (or the first user in auth.users)
  select id into v_user_id from auth.users order by created_at asc limit 1;

  if v_user_id is null then
    raise notice 'No users found in auth.users. Please create an account in the app first.';
    return;
  end if;

  -- Delete existing demo board if it exists
  delete from boards where id = v_board_id;

  -- 1. Create Demo Board
  insert into boards (id, name, created_by, created_at)
  values (v_board_id, 'Sprint 14 — Core Platform & AI Flow', v_user_id, now());

  -- 2. Add Board Member (Owner)
  insert into board_members (board_id, user_id, role)
  values (v_board_id, v_user_id, 'owner')
  on conflict (board_id, user_id) do nothing;

  -- 3. Create Standard Columns
  insert into columns (id, board_id, name, position) values
    (v_col_backlog, v_board_id, 'Backlog', 0),
    (v_col_inprogress, v_board_id, 'In Progress', 1),
    (v_col_review, v_board_id, 'Review', 2),
    (v_col_done, v_board_id, 'Done', 3);

  -- 4. Create Realistic Engineering Cards
  -- Column: Backlog
  insert into cards (id, column_id, title, description, position, labels, due_date, created_at, updated_at) values
    (gen_random_uuid(), v_col_backlog, 'Design empty-state illustrations', 'Create custom SVG empty states for zero-board dashboard and empty retro reports to improve onboarding feel.', 0, array['design', 'feature'], now() + interval '5 days', now() - interval '2 days', now() - interval '2 days'),
    (gen_random_uuid(), v_col_backlog, 'Write onboarding tour copy', 'Draft step-by-step tooltip guide copy highlighting real-time cursor sync and AI retro generation.', 1, array['documentation', 'enhancement'], now() + interval '7 days', now() - interval '2 days', now() - interval '2 days'),
    (gen_random_uuid(), v_col_backlog, 'Audit mobile touch targets', 'Verify all clickable header elements and column action buttons meet the WCAG 44x44px minimum touch target size.', 2, array['enhancement'], now() + interval '10 days', now() - interval '1 day', now() - interval '1 day');

  -- Column: In Progress
  insert into cards (id, column_id, title, description, position, labels, due_date, created_at, updated_at) values
    (gen_random_uuid(), v_col_inprogress, 'Fix Safari drag ghost image', 'Resolve Safari WebKit ghost-drag opacity bug during rapid multi-touch card repositioning.', 0, array['bug'], now() + interval '1 day', now() - interval '4 days', now() - interval '4 days'),
    (gen_random_uuid(), v_col_inprogress, 'Add rate limiting to retro endpoint', 'Implement 5-second client-side throttle cooldown and Edge Function token rate-limiting to prevent Groq API abuse.', 1, array['feature', 'security'], now() + interval '2 days', now() - interval '3 days', now() - interval '3 days'),
    (gen_random_uuid(), v_col_inprogress, 'Optimize card reorder latency', 'Batch optimistic array reordering before broadcasting PostgreSQL change events via Supabase WebSockets.', 2, array['performance', 'enhancement'], now() + interval '3 days', now() - interval '2 days', now() - interval '2 days');

  -- Column: Review
  insert into cards (id, column_id, title, description, position, labels, due_date, created_at, updated_at) values
    (gen_random_uuid(), v_col_review, 'Design system token migration', 'Migrate ad-hoc hex colors across modals and inputs into standardized Tailwind CSS color variables.', 0, array['design', 'enhancement'], now() + interval '1 day', now() - interval '3 days', now() - interval '1 day'),
    (gen_random_uuid(), v_col_review, 'Supabase edge function error logging', 'Add structured JSON logging with request IDs to the generate-retro Deno function.', 1, array['feature'], now() + interval '2 days', now() - interval '2 days', now() - interval '1 day');

  -- Column: Done
  insert into cards (id, column_id, title, description, position, labels, due_date, created_at, updated_at) values
    (gen_random_uuid(), v_col_done, 'Implement dark mode theme switch', 'Added unified dark mode toggle with CSS variable syncing across navbar, canvas, and modals.', 0, array['feature', 'design'], now() - interval '1 day', now() - interval '5 days', now() - interval '1 day'),
    (gen_random_uuid(), v_col_done, 'Set up Vitest testing suite', 'Integrated Vitest, JSDOM, and Testing Library with unit tests for board logic, auth guards, and AI retros.', 1, array['testing'], now() - interval '2 days', now() - interval '4 days', now() - interval '2 days'),
    (gen_random_uuid(), v_col_done, 'Add optimistic UI card drop', 'Instant local DOM updates during dnd-kit drop events to eliminate perceived network roundtrip lag.', 2, array['feature', 'performance'], now() - interval '3 days', now() - interval '6 days', now() - interval '2 days');

  -- 5. Seed an Initial Retrospective
  insert into retros (board_id, content, created_at) values
    (v_board_id, E'# Sprint 14 Retrospective — Core Platform & AI Flow\n\n### 🚀 What Went Well\n- **Dark Mode & Design System**: Successfully implemented full dark mode support across the entire interface without layout shift.\n- **Optimistic UI**: Card drag-and-drop latency dropped below 16ms locally, providing instant tactile feedback.\n- **Automated Test Coverage**: Vitest suite established with 100% pass rate covering board calculations and auth guards.\n\n### ⚠️ Bottlenecks & Stuck Items\n- **Safari Drag Ghost Image**: Lingered in *In Progress* for 4+ days due to WebKit-specific touch event quirks.\n- **Retro Endpoint Cooldown**: Needed client-side rate limiting to prevent accidental double-submits.\n\n### 🎯 Action Plan for Sprint 15\n1. Enforce a Work-In-Progress (WIP) limit of 2 items on the *In Progress* column.\n2. Finalize token rate-limiting on the Groq API edge function.\n3. Complete empty-state illustrations for zero-data views.', now() - interval '1 hour');

  raise notice 'Clean demo board seeded successfully! Board ID: %', v_board_id;
end $$;
