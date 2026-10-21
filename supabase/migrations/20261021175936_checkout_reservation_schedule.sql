-- No HTTP endpoint or secret is exposed for scheduled maintenance.
create extension if not exists pg_cron;
select cron.schedule('eternal-memory-expire-pending-orders', '* * * * *',
  'select public.expire_pending_orders(); delete from public.checkout_quotes where expires_at < now() - interval ''1 day'';');
