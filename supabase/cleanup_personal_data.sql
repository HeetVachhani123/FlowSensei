-- Optional Helper: Purge legacy/personal test boards and cards
-- Run this in Supabase SQL Editor if you want to remove old student/placement test data

-- Delete cards matching personal keywords
delete from cards
where title ilike '%CGPA%'
   or title ilike '%batch%'
   or title ilike '%IDFC%'
   or title ilike '%selected%';

-- Optionally delete any board whose columns were named after friends/people
-- Replace 'Board Name' if needed, or simply delete the old test board from the app UI.
