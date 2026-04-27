ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS notifications (
  id serial PRIMARY KEY,
  shipment_id integer NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  recipient_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(64) NOT NULL,
  title varchar(150) NOT NULL,
  message text NOT NULL,
  channel varchar(20) NOT NULL DEFAULT 'database',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamp,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
ON notifications (recipient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS courier_routes (
  id serial PRIMARY KEY,
  courier_id integer NOT NULL REFERENCES users(id),
  operator_id integer REFERENCES users(id),
  start_address varchar(250) NOT NULL,
  distance_meters integer,
  duration_seconds integer,
  geometry jsonb,
  status varchar(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  confirmed_at timestamp NOT NULL DEFAULT NOW(),
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courier_route_stops (
  id serial PRIMARY KEY,
  route_id integer NOT NULL REFERENCES courier_routes(id) ON DELETE CASCADE,
  courier_delivery_id integer NOT NULL REFERENCES courier_deliveries(id) ON DELETE CASCADE,
  stop_order integer NOT NULL,
  to_address varchar(250) NOT NULL,
  resolved_address varchar(250),
  lat numeric(10, 7),
  lng numeric(10, 7),
  result_status varchar(20),
  result_notes text,
  created_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (route_id, stop_order),
  UNIQUE (route_id, courier_delivery_id)
);

ALTER TABLE courier_deliveries
ADD COLUMN IF NOT EXISTS route_id integer REFERENCES courier_routes(id) ON DELETE SET NULL;

ALTER TABLE courier_deliveries
ADD COLUMN IF NOT EXISTS route_order integer;
