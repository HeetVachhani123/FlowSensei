# FlowSensei — Developer & Architecture Guide

This document outlines the technical architecture, data model, communication protocols, and security implementation of FlowSensei.

---

## 1. High-Level Architecture

FlowSensei follows a full-stack serverless architecture:
- **Frontend:** Single-page application built with React 18, TypeScript, Vite, and Tailwind CSS.
- **Backend & Database:** Supabase (PostgreSQL 15) managing data persistence, GoTrue authentication, and Row-Level Security (RLS) policies. Database queries and mutations execute directly from the client via Supabase client libraries scoped by active session tokens.
- **Serverless Compute:** Supabase Edge Functions (Deno runtime) handle server-side integrations, specifically executing AI retrospective requests to keep external API credentials isolated from client environments.

---

## 2. Directory Structure

```text
FlowSensei/
├── supabase/                       # Backend configuration and database migrations
│   ├── schema.sql                  # Database schema definitions and RLS policies
│   └── functions/
│       └── generate-retro/         # Deno Edge Function for AI generation
├── src/                            # Frontend application source
│   ├── components/                 # Reusable UI components
│   │   ├── board/                  # Kanban components (Column, Card, CardModal, RetroModal)
│   │   ├── providers/              # Context providers (Auth, Theme, Toast)
│   │   ├── ConfirmDialog.tsx       # Modals for destructive action confirmations
│   │   ├── ErrorBoundary.tsx       # Top-level React error boundary
│   │   └── Navbar.tsx              # Global navigation bar
│   ├── hooks/                      # Custom hooks (useAuth, useTheme, useToast)
│   ├── lib/
│   │   ├── supabaseClient.ts       # Supabase client singleton
│   │   └── labelConfig.ts          # Color-mapping configuration for card labels
│   ├── pages/                      # Route-level views
│   │   ├── Board.tsx               # Primary Kanban board with drag-and-drop & realtime
│   │   ├── Dashboard.tsx           # Board directory and workspace management
│   │   ├── Landing.tsx             # Marketing and feature landing page
│   │   └── Login.tsx               # Authentication page
│   ├── test/                       # Unit and integration test suites
│   ├── App.tsx                     # Application shell and route declarations
│   ├── main.tsx                    # React application entry point
│   └── index.css                   # Global styles and Tailwind utility directives
├── vercel.json                     # SPA client rewrite rules for hosting
└── .env.local                      # Local environment variables (Supabase URL & anon key)
```

---

## 3. Database Data Model

The application uses a relational schema defined in `supabase/schema.sql`:

* **`boards`**: Stores project workspaces (`id`, `name`, `created_at`, `updated_at`).
* **`board_members`**: Junction table establishing user access to boards, mapping `user_id` and `board_id` with designated `role` flags (`owner`, `member`).
* **`columns`**: Represents workflow stages (e.g., "To Do", "In Progress", "Done"), associated with a parent `board_id` and an integer `position` index for horizontal ordering.
* **`cards`**: Represents actionable tasks associated with a `column_id` and `board_id`. Stores `title`, `description`, `labels` (array), `due_date`, and an integer `position` for vertical ordering.
* **`retros`**: Persists generated Markdown sprint retrospectives linked to `board_id`.

---

## 4. Key Mechanisms

### A. Real-Time Collaboration (WebSockets)
**Implementation:** `src/pages/Board.tsx`

FlowSensei provides live multi-user synchronization using Supabase Realtime channels:
1. When a user navigates to a board, a channel subscription is registered via `supabase.channel()`.
2. The channel listens to `postgres_changes` on both `columns` and `cards` tables filtered by the current `board_id`.
3. Database mutations (`INSERT`, `UPDATE`, `DELETE`) broadcast event payloads to all connected clients over WebSockets.
4. Active clients ingest the event and update local React state (`cards`, `columns`), synchronizing views without polling.

### B. Drag-and-Drop & Optimistic UI
**Implementation:** `src/pages/Board.tsx` (`handleDragEnd`)

Drag-and-drop interactions rely on `@dnd-kit/core` and `@dnd-kit/sortable`:
1. When a drag action completes across or within columns, local state mutates optimistically to prevent interface latency.
2. A snapshot of the pre-drag card arrangement is retained in an internal reference.
3. The mutation is dispatched asynchronously to Supabase. If the network request fails, state rolls back immediately to the snapshot and an error notification is displayed.
4. During drag operations, remote WebSocket updates matching the active drag identifier are ignored locally to prevent layout jitter.

### C. AI Retrospective Pipeline
**Implementation:** `src/components/board/RetroModal.tsx` & `supabase/functions/generate-retro/index.ts`

1. When triggered from the board interface, current column titles and card distribution summaries are compiled into a payload.
2. The client invokes the Supabase Edge Function endpoint (`/functions/v1/generate-retro`) passing the user's JWT bearer token.
3. The Edge Function accesses the server-side `GROQ_API_KEY` secret, constructs a structured prompt, and queries Groq's `openai/gpt-oss-120b` endpoint.
4. The response content is validated and returned to the client as Markdown, where it is rendered via `react-markdown` and persisted in the `retros` database table.

---

## 5. Security & Authentication

### Authentication (GoTrue)
User sessions are managed by Supabase GoTrue Auth. Session tokens and refresh tokens persist securely in browser storage and attach to API requests via the `Authorization: Bearer` header.

### Row-Level Security (RLS)
Data access is restricted at the PostgreSQL engine level using Row-Level Security:
- Unauthenticated requests cannot read or write to tables.
- Board read and write access require an active membership row in `board_members` matching `auth.uid()`.
- Destructive operations (such as column or board deletions) enforce ownership checks via relational subqueries.

For historical background regarding RLS policy hardening during initial development, refer to [`SECURITY_VERIFICATION.md`](./SECURITY_VERIFICATION.md).

### Anonymous Key Usage
The `VITE_SUPABASE_ANON_KEY` is bundled within the client build. This key acts as an application identifier rather than an administrative credential. All read, write, and delete operations remain governed by PostgreSQL RLS policies evaluated against the authenticated user's JWT.

---

## 6. State Management

The application uses standard React state patterns:
- **Global State:** React contexts manage authentication state (`AuthProvider.tsx`), theme mode (`ThemeProvider.tsx`), and alert notifications (`ToastProvider.tsx`).
- **Board State:** `Board.tsx` serves as the single source of truth for active board columns and cards, passing mutation callbacks downward to `Column.tsx`, `Card.tsx`, and associated modals.
