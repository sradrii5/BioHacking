-- Rate limiting table for API endpoints
-- Sliding window counter: one row per (ip, endpoint)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS api_rate_limits (
  key TEXT PRIMARY KEY,            -- e.g. "rl:newsletter:1.2.3.4"
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries (delete expired rows periodically)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON api_rate_limits (window_start);

-- Optional: auto-delete rows older than 1 hour (keep table lean)
-- Enable pg_cron in Supabase: Database -> Extensions -> pg_cron
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *',
--   $$DELETE FROM api_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour'$$);
