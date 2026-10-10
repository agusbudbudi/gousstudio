-- Revision requests sent by the client from the order page.
-- Array of { round, notes, created_at, review_url, source }, oldest first.
-- review_url snapshots the draft link the client reviewed for that round.
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

alter table orders
  add column if not exists revision_notes jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
