-- When the client approved the current review draft (set by "Setujui Draft" on the order page).
-- Cleared whenever a new draft is sent for review or the order goes back to REVISION.
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

alter table orders
  add column if not exists approved_at timestamptz;

notify pgrst, 'reload schema';
