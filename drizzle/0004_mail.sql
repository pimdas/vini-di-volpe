CREATE TABLE mail_campaigns (id TEXT PRIMARY KEY, subject TEXT NOT NULL, body TEXT NOT NULL, recipients TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', tested INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, created_by TEXT NOT NULL);
CREATE TABLE mail_jobs (id TEXT PRIMARY KEY, campaign_id TEXT, booking_id TEXT, kind TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, token TEXT, status TEXT NOT NULL DEFAULT 'queued', attempts INTEGER NOT NULL DEFAULT 0, provider_id TEXT, error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, next_at TEXT NOT NULL, FOREIGN KEY(campaign_id) REFERENCES mail_campaigns(id));
CREATE UNIQUE INDEX mail_confirmation_once ON mail_jobs(booking_id) WHERE kind='confirmation';
CREATE UNIQUE INDEX mail_campaign_once ON mail_jobs(campaign_id,email) WHERE kind='invitation';
CREATE INDEX mail_queue ON mail_jobs(status,next_at);
CREATE TABLE mail_unsubscribes (token TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE);
