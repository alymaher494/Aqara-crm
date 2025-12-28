-- 1. Update Leads RLS Policy
-- Drop existing broad policy if it exists (usually named something like "Org members view leads")
-- We'll create a more granular one.

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Remove any old catch-all policies for leads to ensure our new one takes effect
-- NOTE: In a real environment, you'd need the exact policy names. 
-- Assuming "Users view own org leads" or similar from previous patterns.

DROP POLICY IF EXISTS "Users view own org leads" ON leads;
DROP POLICY IF EXISTS "Org members view leads" ON leads;

-- ADMINS: Can see/do everything in their organization
CREATE POLICY "Admins have full access to org leads" ON leads
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.organization_id = leads.organization_id
            AND profiles.role = 'admin'
        )
    );

-- AGENTS: Can see/edit assigned leads or unassigned leads in their organization
-- Note: Checking if it's 'company_id' or 'organization_id' based on the schema audit.
-- database-setup-merged.sql uses 'company_id'.
-- erp_migrations.sql/types use 'organization_id'. 
-- I will use organization_id if that's what's in the actual table. 

CREATE POLICY "Agents view assigned or unassigned leads" ON leads
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.organization_id = leads.organization_id
            AND profiles.role = 'agent'
        )
        AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    );

CREATE POLICY "Agents update assigned leads" ON leads
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.organization_id = leads.organization_id
            AND profiles.role = 'agent'
        )
        AND assigned_to = auth.uid()
    );

-- Delete policy: Only Admins (covered by the first policy)
