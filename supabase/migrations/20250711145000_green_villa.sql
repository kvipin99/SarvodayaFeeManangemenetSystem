/*
  # Create bus stops table

  1. New Tables
    - `bus_stops`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `amount` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `bus_stops` table
    - Add policy for admin to manage bus stops
    - Add policy for teachers to read bus stops
*/

CREATE TABLE IF NOT EXISTS bus_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage bus stops"
  ON bus_stops
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can read bus stops"
  ON bus_stops
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'teacher'
    )
  );

-- Insert default bus stops
INSERT INTO bus_stops (name, amount) VALUES
('City Center', 500),
('Railway Station', 600),
('Bus Stand', 450),
('Market Square', 550),
('Hospital Junction', 650),
('Temple Road', 400),
('School Gate', 300)
ON CONFLICT (name) DO NOTHING;