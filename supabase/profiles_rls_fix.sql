-- Migration: Profiles RLS Policies
-- This script enables RLS and adds policies for the profiles table

-- 1. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage organization members" ON profiles;
DROP POLICY IF EXISTS "Organization members can view each other" ON profiles;

-- 3. Policy: Organization members can view each other
CREATE POLICY "Organization members can view each other" ON profiles
    FOR SELECT
    TO authenticated
    USING (
        organization_id = (SELECT p.organization_id FROM profiles p WHERE p.id = auth.uid() LIMIT 1)
        OR id = auth.uid()
    );

-- 4. Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 5. Policy: Admins can manage organization members (INSERT, UPDATE, DELETE)
-- This allows admins to invite new users
-- We use a slightly different approach to avoid recursion
CREATE POLICY "Admins can manage organization members" ON profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
            AND p.organization_id = profiles.organization_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
            AND p.organization_id = profiles.organization_id
        )
    );

-- Special Note: For the admin insert to work where organization_id matches, 
-- the admin must already have their own organization_id set.
