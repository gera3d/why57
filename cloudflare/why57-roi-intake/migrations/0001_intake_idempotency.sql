CREATE TABLE IF NOT EXISTS intake_requests (
  request_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  submission_id TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'delivered', 'failed')),
  stored INTEGER NOT NULL DEFAULT 0 CHECK (stored IN (0, 1)),
  forwarded INTEGER NOT NULL DEFAULT 0 CHECK (forwarded IN (0, 1)),
  receipt_token TEXT NOT NULL UNIQUE,
  receipt_consumed_at TEXT,
  response_status INTEGER,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS intake_requests_status_idx
  ON intake_requests (status, updated_at);

CREATE INDEX IF NOT EXISTS intake_requests_receipt_idx
  ON intake_requests (receipt_token, status)
  WHERE receipt_consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS intake_rate_limits (
  rate_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL CHECK (request_count > 0),
  expires_at INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS intake_rate_limits_expiry_idx
  ON intake_rate_limits (expires_at);
