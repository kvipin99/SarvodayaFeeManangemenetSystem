/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `payment_type` (enum: development, bus, special)
      - `amount` (numeric)
      - `description` (text)
      - `receipt_number` (text, unique)
      - `special_payment_type` (text, nullable)
      - `created_at` (timestamp)
      - `created_by` (text)

  2. Security
    - Enable RLS on `payments` table
    - Add policy for admin to access all payments
    - Add policy for teachers to access payments for their class students
*/

-- Create enum for payment types
CREATE TYPE payment_type AS ENUM ('development', 'bus', 'special');

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_type payment_type NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  receipt_number text UNIQUE NOT NULL,
  special_payment_type text,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can access all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can access payments for their class students"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN students s ON s.class = u.class AND s.division = u.division
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'teacher'
      AND s.id = payments.student_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_number ON payments(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);