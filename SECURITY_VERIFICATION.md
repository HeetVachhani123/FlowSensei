# Security Postmortem & Changelog — RLS DELETE Policies

**Status:** Resolved & Verified  
**Date:** August 2026  
**Scope:** PostgreSQL Row-Level Security (RLS) policies on `cards` and `columns` tables  

---

## 1. Summary

During early development of the multi-board architecture, temporary `USING (true)` expressions were placed on the DELETE policies for `columns` and `cards` to unblock testing around a recursive PostgreSQL JOIN condition. 

Before production deployment, this configuration was audited and identified as an overly permissive state. Correct, scoped JOIN policies were authored in `supabase/schema.sql`, applied to the production database instance, and verified to ensure that only authenticated board owners can delete columns and cards belonging to their respective boards.

---

## 2. Root Cause Analysis

Initial recursive policies attempting to resolve table relationships caused PostgreSQL circular evaluation errors during nested deletes. A temporary permissive policy bypassed the recursion during development, but left DELETE endpoints unprotected from cross-board mutations if an attacker supplied an arbitrary ID.

---

## 3. Implemented Fix

The permissive policies were replaced with non-recursive relational subqueries verifying board ownership through the `board_members` table.

### Columns DELETE Policy
```sql
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
```

### Cards DELETE Policy
```sql
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

## 4. Verification & Validation

The fix was validated through the following checks:
1. **Direct Query Verification:** Queried `pg_policies` for `cards` and `columns` with `cmd = 'DELETE'`. Both policies confirmed active with proper JOIN expressions rather than boolean literals.
2. **Access Control Testing:** Attempted simulated DELETE calls across separate test user accounts. Requests to delete cards or columns from boards not owned by the active user were rejected by PostgreSQL with zero rows affected.
3. **Trigger Validation:** Confirmed that the `handle_cards_updated_at` trigger is registered on `cards` to update timestamps on all row modifications.

---

## 5. Dependency Security Assessment

In addition to database RLS verification, client-side dependencies undergo routine vulnerability audits:

| Package | Assessed Severity | Context & Mitigation | Status |
|---|---|---|---|
| `react-router` | High | Pertains to RSC server-action CSRF. FlowSensei operates as a client-side SPA with no server actions; vulnerability is unexploitable in this architecture. | Monitored |
| `esbuild` / `vite` | Moderate | Affects local development server cross-origin requests only. Production builds deployed to Vercel serve static assets and do not run the dev server. | Monitored |
