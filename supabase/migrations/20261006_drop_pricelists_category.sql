-- Drop pricelists.category: packages are grouped by their parent service (pricelists.service_id)
-- since 20261005_services_as_parent.sql.
--
-- IMPORTANT: run this only AFTER the code that no longer reads/writes `category` is deployed to
-- production. The previous production build still selects/saves this column (CMS pricelist save
-- would fail, and the public /pricelist tabs would break).
--
-- Historical orders are unaffected: they keep their own copy in orders.design_category
-- (and orders.package_details).

alter table pricelists drop column if exists category;
