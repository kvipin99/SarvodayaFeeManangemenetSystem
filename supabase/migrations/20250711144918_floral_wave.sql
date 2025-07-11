/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text, hashed)
      - `role` (enum: admin, teacher)
      - `class` (integer, nullable for teachers)
      - `division` (text, nullable for teachers)
      - `created_at` (timestamp)
      - `last_login` (timestamp, nullable)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for admin users to manage all users
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role user_role NOT NULL DEFAULT 'teacher',
  class integer,
  division text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Insert default admin user (password: admin, hashed)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$rBV2HQ/xsvx0vsC1y2AQSO7sIwHKMA7fSsu7fBdELCC7IztqOvFhi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default class teachers (password: admin, hashed)
DO $$
DECLARE
  class_num integer;
  division_char text;
BEGIN
  FOR class_num IN 1..12 LOOP
    FOR division_char IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E']) LOOP
      INSERT INTO users (username, password, role, class, division)
      VALUES (
        'class' || class_num || lower(division_char),
        '$2b$10$rBV2HQ/xsvx0vsC1y2AQSO7sIwHKMA7fSsu7fBdELCC7IztqOvFhi',
        'teacher',
        class_num,
        division_char
      )
      ON CONFLICT (username) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;