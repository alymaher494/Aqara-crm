-- Migration: Setup Organization and Link Current User
-- This script ensures you have a valid organization and your profile is linked to it

-- 1. Ensure organizations table exists (based on erp_migrations.sql usage)
CREATE TABLE IF NOT EXISTS organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    subscription_plan text DEFAULT 'free',
    max_users int DEFAULT 5,
    expiry_date timestamptz
);

-- 2. Insert a default organization if none exists
INSERT INTO organizations (id, name)
SELECT '00000000-0000-0000-0000-000000000000', 'My Real Estate Org'
WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1)
ON CONFLICT DO NOTHING;

-- 3. Get the ID of the organization (either the one we just created or the existing first one)
DO $$
DECLARE
    org_id uuid;
    user_id uuid;
BEGIN
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    -- 4. Link ALL existing profiles to this organization (for testing convenience)
    -- This ensures your current account gets linked
    UPDATE profiles 
    SET 
        organization_id = org_id,
        role = 'admin', -- Ensure you are an admin so you can invite others
        is_active = true
    WHERE organization_id IS NULL OR role IS NULL;
    
    RAISE NOTICE 'Linked profiles to organization: %', org_id;
END $$;

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';
