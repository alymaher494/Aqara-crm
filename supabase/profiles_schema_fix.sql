-- Migration: Patch Profiles for Team Management
-- This script adds missing columns required by the CRM Team Management UI

-- 1. Add is_active column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Add is_invited column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_invited boolean DEFAULT false;

-- 3. Add avatar_url column if missing (used in UI)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 4. Add phone column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;

-- 5. Add email column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- 6. Ensure created_at exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
