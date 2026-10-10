-- How many times an order was sent back to REVISION (incremented by the CMS Revision button).
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

alter table orders
  add column if not exists revision_count int not null default 0;

notify pgrst, 'reload schema';
