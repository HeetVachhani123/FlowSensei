# Security Verification — RLS DELETE Policies

## Background

During early development, the DELETE policies for `columns` and `cards` were temporarily set to `using (true)` to bypass a PostgreSQL recursive JOIN error. This means any authenticated user could, in theory, send a raw API call to delete any card or column in the database.

**The current `schema.sql` has the correct, fixed policies** using proper JOINs. However, **your deployed Supabase database may still have the old `using (true)` policies** if you ran the schema before they were fixed.

**This verification must be done before any public launch.**

---

## Step 1: Check Current DELETE Policies in Supabase

Run this query in the **Supabase SQL Editor** (`supabase.com/dashboard → SQL Editor`):

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('cards', 'columns')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;
```

### ✅ Safe (Expected) Output

The `qual` column for each policy should contain a **JOIN-based expression**, NOT `true`. Example expected output:

| tablename | policyname | qual |
|-----------|-----------|------|
| `cards`   | Users can delete cards of boards they own | `(EXISTS (SELECT 1 FROM board_members bm JOIN columns c ON c.id = cards.column_id JOIN boards b ON b.id = c.board_id WHERE b.id = c.board_id AND bm.board_id = b.id AND bm.user_id = auth.uid() AND bm.role = 'owner'))` |
| `columns` | Users can delete columns of boards they own | `(EXISTS (SELECT 1 FROM board_members bm JOIN boards b ON b.id = columns.board_id WHERE bm.board_id = columns.board_id AND bm.user_id = auth.uid() AND bm.role = 'owner'))` |

### ❌ Unsafe (Old Dev) Output

If `qual` shows just `true` — the old permissive policy is still active. Proceed to Step 2.

---

## Step 2: Apply the Fix (If Needed)

If Step 1 shows `using (true)`, run these commands in the Supabase SQL Editor:

```sql
-- Fix columns DELETE policy
DROP POLICY IF EXISTS "Users can delete columns of boards they own" ON columns;

CREATE POLICY "Users can delete columns of boards they own"
  ON columns
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM board_members bm
    JOIN boards b ON b.id = columns.board_id
    WHERE bm.board_id = columns.board_id
    AND bm.user_id = auth.uid()
    AND bm.role = 'owner'
  ));

-- Fix cards DELETE policy
DROP POLICY IF EXISTS "Users can delete cards of boards they own" ON cards;

CREATE POLICY "Users can delete cards of boards they own"
  ON cards
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM board_members bm
    JOIN columns c ON c.id = cards.column_id
    JOIN boards b ON b.id = c.board_id
    WHERE b.id = c.board_id
    AND bm.board_id = b.id
    AND bm.user_id = auth.uid()
    AND bm.role = 'owner'
  ));
```

---

## Step 3: Verify the moddatetime Trigger

The `cards.updated_at` field should auto-update whenever a card is modified. Verify the trigger exists:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'handle_cards_updated_at';
```

If the query returns no rows, run:

```sql
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

DROP TRIGGER IF EXISTS handle_cards_updated_at ON cards;

CREATE TRIGGER handle_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);
```

---

## Step 4: Verify the labels + due_date Columns Exist

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cards'
  AND column_name IN ('labels', 'due_date');
```

Expected: 2 rows returned. If 0, run:

```sql
ALTER TABLE cards ADD COLUMN IF NOT EXISTS labels text[] DEFAULT '{}';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;
```

---

## Step 5: Verify retros DELETE Policy

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'retros' AND cmd = 'DELETE';
```

Should return one row with an owner-check condition. If missing, run:

```sql
CREATE POLICY "Users can delete retros of boards they own"
  ON retros
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM board_members bm
    WHERE bm.board_id = retros.board_id
    AND bm.user_id = auth.uid()
    AND bm.role = 'owner'
  ));
```

---

## Pre-Launch Security Checklist

- [ ] Step 1: Confirmed cards + columns DELETE policies use JOINs (not `true`)
- [ ] Step 2: Applied fix if needed
- [ ] Step 3: `handle_cards_updated_at` trigger exists
- [ ] Step 4: `labels` and `due_date` columns exist on `cards`
- [ ] Step 5: `retros` DELETE policy exists
- [ ] Edge Function `FRONTEND_URL` secret set to `https://flow-sensei-khaki.vercel.app` in Supabase Dashboard → Edge Functions → Secrets
- [ ] `GROQ_API_KEY` secret is set in Supabase Edge Function secrets

---

## npm Vulnerability Triage (2026-08)

`npm audit` currently reports **4 vulnerabilities** after running `npm audit fix`. Here is the full triage — each has been investigated and assessed for impact on FlowSensei's architecture:

### 1. `react-router` 7.12.0–8.2.0 — HIGH (CSRF)
- **CVE:** `GHSA-qwww-vcr4-c8h2` — RSC Mode CSRF Bypass
- **Impact on FlowSensei:** ❌ **Not applicable.**
  FlowSensei is a **pure client-side SPA** (no SSR, no React Server Components, no server actions). The CSRF bypass in this CVE requires RSC/server-action infrastructure to be exploitable. Our app has none of this — every route is rendered entirely in the browser.
- **Why not downgraded:** Versions `< 7.12.0` carry 14 additional CVEs including XSS, open redirect, and RCE (all confirmed by `npm audit`). Downgrading trades one inapplicable CVE for multiple applicable ones.
- **Status:** Accepted — not exploitable in this architecture. Will upgrade when a patch release is available.

### 2. `esbuild` ≤ 0.24.2 — MODERATE (dev server request leak)
- **CVE:** `GHSA-67mh-4wv8-2f99` — esbuild dev server allows cross-origin requests
- **Impact on FlowSensei:** ❌ **Not applicable to production.**
  This only affects the **Vite development server** (`npm run dev`). The production build (deployed on Vercel) does not use esbuild's dev server at all.
- **Why not fixed:** The fix requires `npm audit fix --force`, which upgrades Vite to v8 — a **breaking change**. Not worth the instability risk for a dev-only vulnerability.
- **Status:** Accepted — only exploitable if a malicious website is open in the same browser during local development. Not a production concern.

### 3. `vite` ≤ 6.4.2 — (depends on esbuild above)
- Same as above — dev-only, not a production concern.

### Summary

| Package | Severity | Production Impact | Action |
|---------|----------|------------------|--------|
| `react-router` | HIGH | None (requires RSC mode) | Accepted, monitor for patch |
| `esbuild` | MODERATE | None (dev server only) | Accepted, upgrade when Vite v8 is stable |
| `vite` | MODERATE | None (dev server only) | Accepted, upgrade with esbuild |
