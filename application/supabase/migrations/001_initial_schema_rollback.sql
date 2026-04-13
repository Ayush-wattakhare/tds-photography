-- Drop triggers
DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (cascade will drop foreign keys and indexes)
DROP TABLE IF EXISTS line_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
