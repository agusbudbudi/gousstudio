-- Services become the parent entity: each pricelist package belongs to one service.
-- Portfolio items inherit their service through portfolios.pricelist_id -> pricelists.service_id.
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

begin;

-- 1. Link column
alter table pricelists
  add column if not exists service_id int references services(id) on delete set null;

create index if not exists pricelists_service_id_idx on pricelists (service_id);

-- 2. Fix swapped slugs so they match the service titles
update services set slug = 'social-media'      where slug = 'ads'        and title = 'Social Media Design';
update services set slug = 'digital-marketing' where slug = 'management' and title = 'Digital Marketing Design';

-- 3. New service: Social Media Management (appended after the existing ones)
insert into services (slug, title, description, icon, category, color, included, order_index)
select
  'social-media-management',
  'Social Media Management',
  'Akun media sosial dikelola tiap bulan — dari rencana konten, desain, caption, sampai jadwal posting.',
  'TrendingUp',
  'Social Media Management',
  'teal',
  array['Konten bulanan', 'Caption & copywriting', 'Jadwal posting', 'Laporan performa'],
  (select coalesce(max(order_index), -1) + 1 from services)
where not exists (select 1 from services where slug = 'social-media-management');

-- 4. Backfill: package -> service (by pricelist id; review before running)
update pricelists p set service_id = s.id
from services s
where (s.slug, p.id) in (
  -- Brand Identity Design
  ('brand-identity', 647),                     -- Full Brand Identity
  -- Logo Design
  ('logo', 645), ('logo', 646),                -- Logo Design – Starter / Professional
  -- Social Media Design
  ('social-media', 641), ('social-media', 642), ('social-media', 643), ('social-media', 644),  -- Feed Social Media
  ('social-media', 651), ('social-media', 652),                                                -- Starter Pack, Feed + Story + Highlight Kit
  ('social-media', 658), ('social-media', 659), ('social-media', 660), ('social-media', 661),  -- Social Media Design
  -- Social Media Management
  ('social-media-management', 654), ('social-media-management', 655), ('social-media-management', 656),
  -- Poster Design (incl. brochures)
  ('poster', 635), ('poster', 636), ('poster', 640), ('poster', 648), ('poster', 649), ('poster', 650), ('poster', 662),
  ('poster', 637), ('poster', 638), ('poster', 639),                                           -- Brosur
  -- Digital Marketing Design
  ('digital-marketing', 653)                    -- Social Ads Creative – A/B Pack
);
-- Left without a service on purpose: 657 Custom Package, 665 Custom Package - Cikicow

commit;

-- Check: every package and its service
-- select p.id, p.category, p.servicename, s.title as service
-- from pricelists p left join services s on s.id = p.service_id
-- order by s.order_index nulls last, p.category, p.servicename;
