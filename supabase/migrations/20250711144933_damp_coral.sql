/*
  # Create students table

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `admission_number` (text, unique)
      - `name` (text)
      - `mobile` (text)
      - `class` (integer)
      - `division` (text)
      - `bus_stop` (text)
      - `bus_number` (integer)
      - `trip_number` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policy for admin to access all students
    - Add policy for teachers to access only their class students
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number text UNIQUE NOT NULL,
  name text NOT NULL,
  mobile text NOT NULL,
  class integer NOT NULL CHECK (class >= 1 AND class <= 12),
  division text NOT NULL CHECK (division IN ('A', 'B', 'C', 'D', 'E')),
  bus_stop text NOT NULL,
  bus_number integer NOT NULL CHECK (bus_number >= 1 AND bus_number <= 6),
  trip_number integer NOT NULL CHECK (trip_number >= 1 AND trip_number <= 3),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can access all students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can access their class students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'teacher'
      AND users.class = students.class
      AND users.division = students.division
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_division ON students(class, division);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);

-- Insert sample students
INSERT INTO students (admission_number, name, mobile, class, division, bus_stop, bus_number, trip_number) VALUES
('1001', 'Rahul Sharma', '9876543210', 1, 'A', 'City Center', 1, 1),
('1002', 'Priya Patel', '9876543211', 1, 'A', 'Railway Station', 2, 1),
('1003', 'Amit Kumar', '9876543212', 1, 'B', 'Bus Stand', 3, 2),
('1004', 'Sneha Gupta', '9876543213', 2, 'A', 'Market Square', 1, 1),
('1005', 'Ravi Singh', '9876543214', 2, 'B', 'Hospital Junction', 2, 2),
('1006', 'Kavya Reddy', '9876543215', 3, 'A', 'Temple Road', 3, 1),
('1007', 'Arjun Nair', '9876543216', 3, 'B', 'School Gate', 1, 3),
('1008', 'Pooja Joshi', '9876543217', 4, 'A', 'City Center', 2, 1),
('1009', 'Vikram Yadav', '9876543218', 4, 'B', 'Railway Station', 3, 2),
('1010', 'Divya Agarwal', '9876543219', 5, 'A', 'Bus Stand', 1, 1)
ON CONFLICT (admission_number) DO NOTHING;