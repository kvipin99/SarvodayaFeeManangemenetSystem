/*
  # Create fee configurations table

  1. New Tables
    - `fee_configurations`
      - `id` (uuid, primary key)
      - `class` (integer, unique)
      - `development_fee` (numeric)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `fee_configurations` table
    - Add policy for admin to manage fee configurations
    - Add policy for teachers to read fee configurations
*/

CREATE TABLE IF NOT EXISTS fee_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class integer UNIQUE NOT NULL CHECK (class >= 1 AND class <= 12),
  development_fee numeric(10,2) NOT NULL CHECK (development_fee >= 0),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE fee_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage fee configurations"
  ON fee_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can read fee configurations"
  ON fee_configurations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'teacher'
    )
  );

-- Insert default fee configurations
INSERT INTO fee_configurations (class, development_fee) VALUES
(1, 1100), (2, 1200), (3, 1300), (4, 1400), (5, 1500), (6, 1600),
(7, 1700), (8, 1800), (9, 1900), (10, 2000), (11, 2100), (12, 2200)
ON CONFLICT (class) DO NOTHING;