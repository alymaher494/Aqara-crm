-- migration: whatsapp_and_rbac_v2

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    leader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 2. Update Profiles to support Team-based hierarchy
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Update Campaigns to track creator
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- 4. WhatsApp Devices Table
CREATE TABLE IF NOT EXISTS whatsapp_devices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    session_id text UNIQUE,
    status text DEFAULT 'disconnected', -- init, scanned, connected, disconnected
    phone_number text,
    qr_code text, -- Actual base64 or string for the QR
    last_active timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- 5. Enhanced RLS Policies

-- Teams RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view teams" ON teams 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = teams.organization_id));
CREATE POLICY "Admins manage teams" ON teams 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = teams.organization_id AND role = 'admin'));

-- Update Campaign RLS for Hierarchy
DROP POLICY IF EXISTS "Org members can view campaigns" ON campaigns;
CREATE POLICY "Hierarchy-based campaign visibility" ON campaigns 
    FOR SELECT USING (
        -- Agent sees their own
        (created_by = auth.uid()) OR
        -- Admin sees all in org
        (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND organization_id = campaigns.organization_id)) OR
        -- Team Leader sees their team's campaigns
        (EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.team_id IS NOT NULL 
            AND p.team_id = (SELECT team_id FROM profiles WHERE id = campaigns.created_by)
            AND EXISTS (SELECT 1 FROM teams t WHERE t.id = p.team_id AND t.leader_id = auth.uid())
        ))
    );

-- WhatsApp Devices RLS (Admin Only for Management)
ALTER TABLE whatsapp_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can VIEW connection status" ON whatsapp_devices 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = whatsapp_devices.organization_id));
CREATE POLICY "Admins manage WhatsApp session" ON whatsapp_devices 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'super_admin' OR (organization_id = whatsapp_devices.organization_id AND role = 'admin'))));
