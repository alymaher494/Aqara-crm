-- Migration: Promote User to Super Admin
-- This script grants Super Admin privileges to a specific user

-- 1. Ensure is_super_admin column exists in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- 2. Ensure app_admins table exists and has unique constraint
CREATE TABLE IF NOT EXISTS app_admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

-- Ensure unique constraint exists for ON CONFLICT to work
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'app_admins_user_id_key'
    ) THEN
        ALTER TABLE app_admins ADD CONSTRAINT app_admins_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 3. Promote the user
-- Replace your email below or it will apply to the currently logged in user if running in SQL editor with auth.uid()
DO $$
DECLARE
    target_user_id uuid := auth.uid(); -- Promotes the person running the script
BEGIN
    -- Update profile
    UPDATE profiles 
    SET is_super_admin = true, role = 'admin'
    WHERE id = target_user_id;

    -- Add to app_admins table for compatibility
    INSERT INTO app_admins (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'User % has been promoted to Super Admin', target_user_id;
END $$;
