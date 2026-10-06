-- Portfolio items belong to a service directly (portfolios.service_id), replacing portfolios.category.
-- portfolios.pricelist_id stays as an optional "example of this package" link.
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

begin;

alter table portfolios
  add column if not exists service_id int references services(id) on delete set null;

create index if not exists portfolios_service_id_idx on portfolios (service_id);

-- Backfill from the old category (more accurate than the linked package for these items)
update portfolios p set service_id = s.id
from services s
where p.service_id is null
  and s.slug = case p.category
    when 'poster'     then 'poster'
    when 'feed'       then 'social-media'
    when 'logo'       then 'logo'
    when 'ecommerce'  then 'digital-marketing'
    when 'ads'        then 'digital-marketing'
    when 'management' then 'social-media-management'
  end;

commit;

-- Check: rows per old category -> new service (every row should have a service)
-- select p.category, s.title as service, count(*)
-- from portfolios p left join services s on s.id = p.service_id
-- group by 1, 2 order by 1;
--
-- portfolios.category is dropped later, after the code that no longer uses it is deployed:
-- alter table portfolios drop column if exists category;
