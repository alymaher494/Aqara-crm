-- Core Inventory Structure for Dynamic Brokerage
-- 1. Developers Table
CREATE TABLE IF NOT EXISTS developers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    logo_url text,
    website text,
    sales_hotline text,
    created_at timestamptz DEFAULT now()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    developer_id uuid REFERENCES developers(id) ON DELETE CASCADE,
    name text NOT NULL,
    location text, -- e.g., New Capital, New Cairo
    market_status text, -- selling, launching_soon, sold_out, hold
    price_range_min numeric,
    price_range_max numeric,
    description text,
    attachments jsonb DEFAULT '[]'::jsonb, -- store URLs for brochures
    created_at timestamptz DEFAULT now()
);

-- 3. Market Reports (Gamification Layer)
CREATE TABLE IF NOT EXISTS market_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    report_type text NOT NULL, -- price_change, status_change, new_launch
    details text,
    status text DEFAULT 'pending', -- pending, approved, rejected
    points_awarded int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_projects_dev ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(market_status);
CREATE INDEX IF NOT EXISTS idx_market_reports_project ON market_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_market_reports_status ON market_reports(status);

-- Enable RLS
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Developers: Read-only for org members, All for admins
CREATE POLICY "Org members can view developers" ON developers 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = developers.organization_id));

CREATE POLICY "Admins can manage developers" ON developers 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = developers.organization_id AND role = 'admin'));

-- Projects: Read-only for org members, All for admins
CREATE POLICY "Org members can view projects" ON projects 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = projects.organization_id));

CREATE POLICY "Admins can manage projects" ON projects 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = projects.organization_id AND role = 'admin'));

-- Market Reports: All members can view, Users can insert, Admins manage status
CREATE POLICY "Org members can view market reports" ON market_reports 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = market_reports.organization_id));

CREATE POLICY "Users can insert their own reports" ON market_reports 
    FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = market_reports.organization_id));

CREATE POLICY "Admins manage market reports status" ON market_reports 
    FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = market_reports.organization_id AND role = 'admin'));

-- 5. Linking Market News to Projects (Reference setup)
ALTER TABLE market_news 
    ADD CONSTRAINT fk_market_news_project 
    FOREIGN KEY (related_project_id) 
    REFERENCES projects(id) 
    ON DELETE SET NULL;
