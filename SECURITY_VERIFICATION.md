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
