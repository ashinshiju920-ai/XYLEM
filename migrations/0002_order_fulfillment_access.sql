-- Per-order access-token hash used to authorize customer status and downloads.
-- Apply this migration once to each existing D1 database after 0001_init.sql.
ALTER TABLE orders ADD COLUMN fulfillment_token_hash TEXT;
