CREATE TABLE IF NOT EXISTS rental_contracts (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  draft jsonb NOT NULL,
  edit_version integer NOT NULL DEFAULT 1 CHECK (edit_version > 0),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  last_write uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rental_contracts_owner_updated_idx
  ON rental_contracts (owner_id, updated_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS rental_contract_revisions (
  contract_id uuid NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
  revision integer NOT NULL CHECK (revision > 0),
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contract_id, revision)
);
