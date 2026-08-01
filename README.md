# FlowSensei 🌊🥋
*A real-time collaborative Kanban board with AI-generated sprint retrospectives.*

🔗 **[Live Demo](https://flow-sensei-khaki.vercel.app)** 

## Why "FlowSensei"?
* **Flow**: Keeping your team's work moving smoothly without bottlenecks (the elusive "flow state").
* **Sensei**: Your AI mentor that analyzes your board and generates actionable weekly retrospectives.

## Overview
FlowSensei is a production-ready, full-stack project management tool designed for teams. It combines the tactile satisfaction of a drag-and-drop Kanban board with powerful real-time collaboration and AI-driven insights, ensuring everyone stays on the same page and learns from past sprints.

## Key Features
- **Real-Time Collaboration**: See cards move and update instantly across all connected clients.
- **AI Retrospectives**: Generate comprehensive Markdown reports of your board's status, bottlenecks, and action items using Llama 3 via the Groq API.
- **Drag-and-Drop Interface**: Smooth, accessible column and card reordering using `@dnd-kit`.
- **Optimistic UI Updates**: Instant frontend state updates that mask network latency for a buttery-smooth user experience.
- **Secure Board Management**: Create multiple boards, with Row-Level Security (RLS) ensuring you only access data you own or are a member of.
- **Dark Mode Support**: Beautiful, fully responsive UI built with Tailwind CSS that respects system preferences.
- **Custom Notifications & Dialogs**: Built-in toast notifications and custom destructive action modals.

## Tech Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, `@dnd-kit`
* **Backend**: Supabase (PostgreSQL, GoTrue Auth)
* **Realtime Sync**: Supabase Realtime (`postgres_changes` WebSockets)
* **AI Integration**: Supabase Edge Functions (Deno), Groq API (Llama 3), `react-markdown`
* **Hosting**: Vercel

## Technical Highlights

### ⚡ Live Multi-User Sync (Supabase Realtime)
To support collaborative planning, FlowSensei relies heavily on Supabase's Realtime WebSocket connections. Instead of polling the database, the client subscribes to `postgres_changes` events on the `cards` and `columns` tables. 

When a user drags a card to a new column, the app performs an **Optimistic UI Update** to instantly reflect the change locally, while simultaneously dispatching the `UPDATE` mutation to Postgres. Supabase then broadcasts this payload to all other connected clients, triggering React state updates across the board. This architecture ensures zero-latency feel for the active user while keeping the entire team perfectly in sync.

### 🧠 Edge-Computed AI Retrospectives
The "Sensei" feature leverages a **Supabase Edge Function** (`generate-retro`) written in TypeScript/Deno to securely interface with the Groq API. 

When triggered, the Edge Function queries the current state of the board, maps the data into a token-efficient format, and prompts a Llama 3 model to analyze the workflow. The Edge Function streams back a structured Markdown report highlighting stalled tasks, workload imbalances, and recommended action items. Moving this logic to an Edge Function keeps API keys secure and offloads heavy processing from the client.

## Screenshots

<p align="center">
  <img alt="Dashboard" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'><defs><linearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230c0c0d'/><stop offset='100%25' stop-color='%2318181b'/></linearGradient></defs><rect width='800' height='400' fill='url(%23bg)'/><rect x='0' y='0' width='800' height='40' fill='%230c0c0d' stroke='%2327272a'/><circle cx='28' cy='20' r='9' fill='%2318181b' stroke='%233f3f46'/><text x='44' y='26' font-family='Segoe UI,Roboto,sans-serif' font-size='14' font-weight='700' fill='%23fafafa'>F</text><text x='66' y='26' font-family='Segoe UI,Roboto,sans-serif' font-size='12' font-weight='600' fill='%23e4e4e7'>FlowSensei</text><circle cx='772' cy='20' r='7' fill='%233f3f46'/><text x='110' y='86' font-family='Segoe UI,Roboto,sans-serif' font-size='22' font-weight='700' fill='%23fafafa'>Projects</text><text x='110' y='108' font-family='Segoe UI,Roboto,sans-serif' font-size='12' fill='%23a1a1aa'>Manage your boards and workflows.</text><g transform='translate(100,140)'><rect width='160' height='110' rx='10' fill='%23121214' stroke='%233f3f46'/><text x='16' y='28' font-family='Segoe UI,Roboto,sans-serif' font-size='13' font-weight='600' fill='%23e4e4e7'>Website Redesign</text><text x='16' y='98' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%2371717a'>Open board →</text></g><g transform='translate(280,140)'><rect width='160' height='110' rx='10' fill='%23121214' stroke='%233f3f46'/><text x='16' y='28' font-family='Segoe UI,Roboto,sans-serif' font-size='13' font-weight='600' fill='%23e4e4e7'>Mobile App v2</text><text x='16' y='98' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%2371717a'>Open board →</text></g><g transform='translate(460,140)'><rect width='160' height='110' rx='10' fill='%23121214' stroke='%233f3f46'/><text x='16' y='28' font-family='Segoe UI,Roboto,sans-serif' font-size='13' font-weight='600' fill='%23e4e4e7'>Sprint 14 — Onboarding</text><text x='16' y='98' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%2371717a'>Open board →</text></g><g transform='translate(640,140)'><rect width='80' height='110' rx='10' fill='%23121214' stroke='%233f3f46' stroke-dasharray='4 4'/><text x='28' y='62' font-family='Segoe UI,Roboto,sans-serif' font-size='22' fill='%2352525b'>+</text></g></svg>" />
  <br><em>The Projects Dashboard — pick a board, start a new one, or delete an old one.</em>
</p>

<p align="center">
  <img alt="Kanban Board" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'><defs><linearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230c0c0d'/><stop offset='100%25' stop-color='%23111827'/></linearGradient></defs><rect width='800' height='400' fill='url(%23bg2)'/><rect x='0' y='0' width='800' height='40' fill='%230c0c0d' stroke='%2327272a'/><text x='40' y='26' font-family='Segoe UI,Roboto,sans-serif' font-size='14' font-weight='700' fill='%23fafafa'>Sprint 14 — Onboarding</text><rect x='680' y='10' width='92' height='22' rx='6' fill='%234f46e5'/><text x='702' y='26' font-family='Segoe UI,Roboto,sans-serif' font-size='11' font-weight='600' fill='%23fafafa'>⚡ AI Retro</text><g transform='translate(40,70)'><rect width='160' height='300' rx='10' fill='%23121214' stroke='%2327272a'/><rect x='12' y='12' width='120' height='10' rx='3' fill='%233f3f46'/><text x='140' y='22' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%23a1a1aa'>4</text><rect x='10' y='36' width='140' height='48' rx='8' fill='%2318181b' stroke='%233f3f46'/><rect x='18' y='46' width='24' height='8' rx='2' fill='%23ef4444'/><text x='18' y='72' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Design sign-up flow</text><rect x='10' y='92' width='140' height='48' rx='8' fill='%2318181b' stroke='%233f3f46'/><text x='18' y='128' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Wireframe payments</text><rect x='10' y='148' width='140' height='48' rx='8' fill='%2318181b' stroke='%233f3f46'/><rect x='18' y='158' width='26' height='8' rx='2' fill='%233b82f6'/><text x='18' y='184' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Fix favicon on Safari</text></g><g transform='translate(220,70)'><rect width='160' height='300' rx='10' fill='%23121214' stroke='%2327272a'/><rect x='12' y='12' width='120' height='10' rx='3' fill='%233f3f46'/><text x='140' y='22' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%23a1a1aa'>2</text><rect x='10' y='36' width='140' height='48' rx='8' fill='%2318181b' stroke='%23f59e0b80'/><text x='18' y='72' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Build email templates</text></g><g transform='translate(400,70)'><rect width='160' height='300' rx='10' fill='%23121214' stroke='%2327272a'/><rect x='12' y='12' width='120' height='10' rx='3' fill='%233f3f46'/><text x='140' y='22' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%23a1a1aa'>1</text><rect x='10' y='36' width='140' height='48' rx='8' fill='%2318181b' stroke='%236366f180'/><rect x='18' y='46' width='30' height='8' rx='2' fill='%236366f1'/><text x='18' y='72' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>AI retro generator</text></g><g transform='translate(580,70)'><rect width='160' height='300' rx='10' fill='%23121214' stroke='%2327272a'/><rect x='12' y='12' width='120' height='10' rx='3' fill='%233f3f46'/><text x='140' y='22' font-family='Segoe UI,Roboto,sans-serif' font-size='10' fill='%23a1a1aa'>3</text><rect x='10' y='36' width='140' height='48' rx='8' fill='%2318181b' stroke='%2310b98180'/><text x='18' y='72' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Add dark mode toggle</text><rect x='10' y='92' width='140' height='48' rx='8' fill='%2318181b' stroke='%2310b98180'/><text x='18' y='128' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Ship login page</text></g></svg>" />
  <br><em>Real-time drag &amp; drop Kanban board — cards move instantly across columns.</em>
</p>

<p align="center">
  <img alt="AI Retro" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'><defs><linearGradient id='bg3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230c0c0d'/><stop offset='100%25' stop-color='%23312e81'/></linearGradient></defs><rect width='800' height='400' fill='url(%23bg3)'/><rect x='20' y='20' width='180' height='360' rx='10' fill='%23121214' stroke='%233f3f46'/><text x='40' y='50' font-family='Segoe UI,Roboto,sans-serif' font-size='13' font-weight='700' fill='%23fafafa'>⚡ AI Retrospectives</text><rect x='30' y='76' width='160' height='36' rx='6' fill='%234f46e5'/><text x='58' y='100' font-family='Segoe UI,Roboto,sans-serif' font-size='12' font-weight='600' fill='%23fafafa'>+ Generate Retro</text><rect x='30' y='136' width='160' height='28' rx='6' fill='%23312e81'/><text x='42' y='154' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e4e4e7'>Jul 31, 2026</text><rect x='30' y='172' width='160' height='28' rx='6' fill='%231f2937'/><text x='42' y='190' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23a1a1aa'>Jul 24, 2026</text><rect x='220' y='20' width='560' height='360' rx='10' fill='%23121214' stroke='%233f3f46'/><circle cx='750' cy='40' r='12' fill='%233f3f46'/><text x='250' y='64' font-family='Segoe UI,Roboto,sans-serif' font-size='18' font-weight='800' fill='%23fafafa'>Sprint 14 — Retrospective</text><text x='250' y='100' font-family='Segoe UI,Roboto,sans-serif' font-size='14' font-weight='700' fill='%23fafafa'>👍 What went well</text><text x='260' y='122' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23d4d4d8'>• Dark mode shipped ahead of schedule</text><text x='260' y='142' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23d4d4d8'>• "Add card" dropped to 320ms P95</text><text x='250' y='176' font-family='Segoe UI,Roboto,sans-serif' font-size='14' font-weight='700' fill='%23fafafa'>🚧 What got stuck</text><text x='260' y='198' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23fca5a5'>• *"Design sign-up flow"* — 2 weeks in To Do</text><text x='260' y='218' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23fca5a5'>• In Progress column is a bottleneck</text><text x='250' y='252' font-family='Segoe UI,Roboto,sans-serif' font-size='14' font-weight='700' fill='%23fafafa'>💡 Suggestion for next week</text><rect x='250' y='266' width='500' height='64' rx='8' fill='%23312e8150' stroke='%236366f1'/><text x='266' y='294' font-family='Segoe UI,Roboto,sans-serif' font-size='11' fill='%23e0e7ff'><tspan x='266' dy='0'>Set a WIP limit of 2 on In Progress and pair-design</tspan><tspan x='266' dy='14'>the sign-up flow with the backend owner.</tspan></text><circle cx='740' cy='330' r='22' fill='%23312e81' opacity='0.8'/><text x='740' y='342' text-anchor='middle' font-family='serif' font-size='24' fill='%23fafafa'>禅</text></svg>" />
  <br><em>AI-generated weekly retrospective — Sensei finds bottlenecks and suggests actions.</em>
</p>

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

4. **Initialize the Database:**
   Run the SQL scripts located in `supabase/schema.sql` inside your Supabase project's SQL Editor to create the tables and Row-Level Security (RLS) policies.

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
