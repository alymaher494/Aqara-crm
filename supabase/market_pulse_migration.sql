-- migration for Market Intelligence (Market Pulse)
CREATE TABLE IF NOT EXISTS market_news (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    source text NOT NULL, -- 'whatsapp_group', 'news_site', 'manual'
    content_raw text NOT NULL,
    extracted_data jsonb DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
    confidence_score float4,
    related_project_id uuid, -- Placeholder for future linking to projects/properties
    created_at timestamptz DEFAULT now()
);

-- Index for status filtering and organization
CREATE INDEX IF NOT EXISTS idx_market_news_status ON market_news(status);
CREATE INDEX IF NOT EXISTS idx_market_news_org ON market_news(organization_id);

-- Enable Row Level Security
ALTER TABLE market_news ENABLE ROW LEVEL SECURITY;

-- Policies for Multi-tenancy
CREATE POLICY "Org members can view market news" 
ON market_news FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND organization_id = market_news.organization_id
    )
);

CREATE POLICY "Admins can manage market news" 
ON market_news FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND organization_id = market_news.organization_id 
        AND role = 'admin'
    )
);

-- Service accounts or system triggers can insert (for future WhatsApp API integration)
-- For now, allow org members to insert manual news
CREATE POLICY "Org members can insert news" 
ON market_news FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND organization_id = market_news.organization_id
    )
);
