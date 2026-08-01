# FlowSensei - Developer & Architecture Guide

This document serves as a comprehensive "brain dump" of the FlowSensei architecture. Whether you are returning to this project after a long break, onboarding a new developer, or explaining the project in an interview, this guide breaks down exactly how everything works under the hood.

---

## 1. High-Level Architecture

FlowSensei is a **Full-Stack Serverless Application**. 
- **Frontend:** A React Single Page Application (SPA) built with Vite and TypeScript.
- **Backend/Database:** Supabase (PostgreSQL). There is no traditional "server" (like an Express.js or Python backend). Instead, the frontend talks directly to the Postgres database securely using Row-Level Security (RLS) policies.
- **Serverless Compute:** Supabase Edge Functions (Deno) are used strictly for securely running the AI Retrospective logic without exposing API keys to the browser.

---

## 2. Directory Structure

Here is where everything lives:

```text
FlowSensei/
├── supabase/                       # All backend configuration
│   ├── schema.sql                  # The entire database schema (tables & RLS policies)
│   └── functions/
│       └── generate-retro/         # The Edge Function code for AI generation
├── src/                            # All frontend React code
│   ├── components/                 # Reusable UI components
│   │   ├── board/                  # Kanban-specific components (Column, Card, etc.)
│   │   ├── ConfirmDialog.tsx       # Custom delete confirmation modal
│   │   └── toast.tsx               # Toast notification system
│   ├── hooks/                      
│   │   ├── useAuth.tsx             # Global authentication state context
│   │   └── useTheme.tsx            # Dark/Light mode manager
│   ├── lib/
│   │   └── supabaseClient.ts       # Singleton instance of the Supabase JS client
│   ├── pages/                      # Top-level route components
│   │   ├── Board.tsx               # The main Kanban board view (Drag-and-Drop + Realtime)
│   │   ├── Dashboard.tsx           # The project selection screen
│   │   └── Login.tsx               # Auth screen
│   ├── App.tsx                     # React Router configuration
│   └── index.css                   # Tailwind CSS imports & global styles
├── vercel.json                     # Routing config for Vercel deployment
└── .env.local                      # Environment variables (Supabase keys)
```

---

## 3. The Database Data Model

The app relies on a fully relational PostgreSQL database hosted on Supabase.

*   **`boards`**: Represents a single project/workspace.
*   **`board_members`**: A junction table linking a user to a board with a specific `role` (e.g., owner). This is crucial for security to ensure users can only see boards they belong to.
*   **`columns`**: Represents a column (e.g., "To Do", "In Progress"). It belongs to a specific `board_id` and has a `position` integer for ordering.
*   **`cards`**: Represents a task. It belongs to a specific `column_id` and `board_id`. It stores title, description, labels, due date, and a `position` integer for vertical ordering.

---

## 4. Key Mechanisms Explained

### A. Real-Time Collaboration (WebSockets)
**File:** `src/pages/Board.tsx`

If two users have the same board open, they see changes instantly. This is achieved using **Supabase Realtime**. 
1. In `Board.tsx`, we create a `supabase.channel()`.
2. We subscribe to `postgres_changes` for the `columns` and `cards` tables, specifically filtering by the current `board_id`.
3. Whenever *anyone* INSERTS, UPDATES, or DELETES a row in the database, the WebSocket pushes an event to the browser.
4. The React app catches this event and updates the local state array (`setCards` or `setColumns`), causing the UI to re-render for everyone seamlessly.

### B. Drag-and-Drop & Optimistic UI
**File:** `src/pages/Board.tsx` (`handleDragEnd`)

Dragging is handled by `@dnd-kit/core`. The tricky part is network latency. If we waited for the database to confirm a drag, the UI would feel laggy and terrible.
To fix this, we use **Optimistic Updates**:
1. User drops a card in a new column.
2. The frontend *immediately* updates the React state to show the card in the new column.
3. Behind the scenes, it fires an `UPDATE` request to Supabase.
4. *Self-Correction:* To prevent the Realtime WebSocket from conflicting with our local optimistic update and causing the card to "flicker" or jump around, the Realtime listener ignores WebSocket events that match the active drag item.

### C. The AI Retrospective ("Sensei")
**Files:** `src/components/board/RetroModal.tsx` & `supabase/functions/generate-retro/index.ts`

When a user clicks "Generate Retro":
1. The frontend gathers all columns and cards on the board and sends them to our secure Supabase Edge Function.
2. The Edge function securely retrieves the `GROQ_API_KEY` from Supabase secrets.
3. It maps the board data into a JSON string and sends a prompt to Groq's **Llama 3** model, asking it to analyze bottlenecks and output a Markdown report.
4. The frontend receives the Markdown string and renders it beautifully using `react-markdown`.

---

## 5. Security & Authentication

### GoTrue Auth
User signup/login is handled by Supabase Auth (GoTrue). The session token is automatically stored in `localStorage` and attached to all future database requests.

### Row-Level Security (RLS)
The database is heavily locked down. By default, no one can read or write anything. We use PostgreSQL RLS policies to write rules like:
* *"Users can view boards they are a member of"*
* *"Users can insert columns on boards they own"*

**⚠️ DEPLOYMENT ACTION REQUIRED:**
The `schema.sql` now has correct, JOIN-based DELETE policies for `columns` and `cards`. However, if your **deployed Supabase** database was created before this fix, it may still have the old permissive `using (true)` policies.

**Before going live, follow the steps in [`SECURITY_VERIFICATION.md`](./SECURITY_VERIFICATION.md)** to verify and fix your production Supabase RLS policies using the SQL Editor.

### S2 — Anon Key Exposure is Intentional
You will see the `VITE_SUPABASE_ANON_KEY` exposed in the client bundle. **This is completely safe and intentional.** Supabase uses this key to identify the *project*, not to grant administrative access. All data access is strictly governed by the RLS policies and JWT session token.

---

## 6. Frontend State Management

Instead of heavy tools like Redux, FlowSensei relies on standard React patterns:
- **Global State:** Auth context (`useAuth.tsx`) and Theme context (`useTheme.tsx`).
- **Local State:** `Board.tsx` holds the master array of `columns` and `cards`. Child components (like `Column.tsx` and `CardModal.tsx`) receive data and mutation functions via props.

## Summary 
FlowSensei is a prime example of a modern, serverless application. It pushes heavy lifting (like WebSockets and AI integrations) to managed services (Supabase & Groq), allowing the frontend to remain lightweight, blazing fast, and highly interactive.
