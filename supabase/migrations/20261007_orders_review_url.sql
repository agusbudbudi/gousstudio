-- Link to the design draft sent for client review (set on IN PROGRESS/REVISION → REVIEWED).
-- Shown on the client order page and portal while the order is REVIEWED.
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

alter table orders
  add column if not exists review_url text;
