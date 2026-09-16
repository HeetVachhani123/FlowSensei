# FlowSensei 🌊🥋
*A real-time collaborative Kanban board with AI-generated sprint retrospectives.*

🔗 **[Live Demo](https://flow-sensei-khaki.vercel.app)** 

## Why "FlowSensei"?
* **Flow**: Keeping your team's work moving smoothly without bottlenecks (the elusive "flow state").
* **Sensei**: Your AI mentor that analyzes your board and generates actionable weekly retrospectives.

## Overview
FlowSensei is a full-stack project management tool designed for teams. It combines the tactile satisfaction of a drag-and-drop Kanban board with powerful real-time collaboration and AI-driven insights, ensuring everyone stays on the same page and learns from past sprints.

## Key Features
- **Real-Time Collaboration**: See cards move and update instantly across all connected clients.
- **AI Retrospectives**: Generate comprehensive Markdown reports of your board's status, bottlenecks, and action items using `openai/gpt-oss-120b` via the Groq API.
- **Drag-and-Drop Interface**: Smooth, accessible column and card reordering using `@dnd-kit`.
- **Optimistic UI Updates**: Instant frontend state updates that mask network latency for a buttery-smooth user experience.
- **Secure Board Management**: Create multiple boards, with Row-Level Security (RLS) ensuring you only access data you own or are a member of.
- **Dark Mode Support**: Beautiful, fully responsive UI built with Tailwind CSS that respects system preferences.
- **Custom Notifications & Dialogs**: Built-in toast notifications and custom destructive action modals.

## Tech Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, `@dnd-kit`
* **Backend**: Supabase (PostgreSQL, GoTrue Auth)
* **Realtime Sync**: Supabase Realtime (`postgres_changes` WebSockets)
* **AI Integration**: Supabase Edge Functions (Deno), Groq API (`openai/gpt-oss-120b`), `react-markdown`
* **Hosting**: Vercel

## Project Structure (Highlights)
```text
src/
  components/
    providers/
      AuthProvider.tsx
      ThemeProvider.tsx
      ToastProvider.tsx
  hooks/
    useAuth.ts
    useTheme.ts
    useToast.ts
```
*(Organized for strict React Fast Refresh compliance)*

## Technical Highlights

### ⚡ Live Multi-User Sync (Supabase Realtime)
To support collaborative planning, FlowSensei relies heavily on Supabase's Realtime WebSocket connections. Instead of polling the database, the client subscribes to `postgres_changes` events on the `cards` and `columns` tables. 

When a user drags a card to a new column, the app performs an **Optimistic UI Update** to instantly reflect the change locally, while simultaneously dispatching the `UPDATE` mutation to Postgres. Supabase then broadcasts this payload to all other connected clients, triggering React state updates across the board. This architecture ensures zero-latency feel for the active user while keeping the entire team perfectly in sync.

### 🧠 Edge-Computed AI Retrospectives
The "Sensei" feature leverages a **Supabase Edge Function** (`generate-retro`) written in TypeScript/Deno to securely interface with the Groq API. 

When triggered, the Edge Function queries the current state of the board, maps the data into a token-efficient format, and prompts Groq's `openai/gpt-oss-120b` model to analyze the workflow. The Edge Function streams back a structured Markdown report highlighting stalled tasks, workload imbalances, and recommended action items. Moving this logic to an Edge Function keeps API keys secure and offloads heavy processing from the client.

## Screenshots

<!-- screenshot: dashboard.png -->

<!-- screenshot: board.png -->

<!-- screenshot: retro-modal.png -->

## Local Setup

### Prerequisites
* Node.js (v18+)
* A free [Supabase](https://supabase.com) account
* A free [Groq](https://console.groq.com/) API key (for the AI features)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/HeetVachhani123/FlowSensei.git
   cd FlowSensei
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example `.env` file:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize and Seed the Database:**
   - Run `supabase/schema.sql` in your Supabase SQL Editor to establish tables and Row-Level Security (RLS) policies.
   - *(Optional)* Run `supabase/seed.sql` to populate a clean, public-ready demo board with realistic engineering tasks and a sample retrospective. Alternatively, use the in-app **"Load Demo Board"** button on the Dashboard.

5. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy generate-retro
   supabase secrets set --env-file ./supabase/.env
   ```
   *(Make sure your `supabase/.env` contains your `GROQ_API_KEY`)*

6. **Run the development server:**
   ```bash
   npm run dev
   ```

## Future Improvements
* **Role-Based Access Control (RBAC):** Expanding `board_members` roles to distinguish between Viewers, Editors, and Admins.
* **Card Attachments:** Leveraging Supabase Storage to allow image and file uploads directly onto cards.
* **Offline Mode:** Implementing a service worker and IndexedDB to queue mutations when the network drops.
