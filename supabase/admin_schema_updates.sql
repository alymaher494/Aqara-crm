-- Add status column to organizations if it doesn't exist
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Support for super_admin flag in profiles if preferred by user later
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Sync app_admins to profiles for easy checking
UPDATE profiles 
SET is_super_admin = true 
WHERE id IN (SELECT user_id FROM app_admins);
