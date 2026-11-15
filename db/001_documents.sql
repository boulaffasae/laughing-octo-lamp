CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  blob_path text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('contract', 'upload')),
  byte_size integer NOT NULL CHECK (byte_size > 0),
  content_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, kind, content_hash)
);

CREATE INDEX IF NOT EXISTS documents_owner_created_idx
  ON documents (owner_id, created_at DESC, id DESC);
