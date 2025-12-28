-- migration: campaigns_logic
-- 1. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    status text DEFAULT 'draft', -- draft, scheduled, completed, running
    message_template text NOT NULL,
    target_filters jsonb DEFAULT '{}'::jsonb,
    total_leads int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 2. Campaign Queue
CREATE TABLE IF NOT EXISTS campaign_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- pending, sent, failed
    sent_at timestamptz,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaign_queue_campaign ON campaign_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_queue_status ON campaign_queue(status);

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view campaigns" ON campaigns 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = campaigns.organization_id));

CREATE POLICY "Admins can manage campaigns" ON campaigns 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = campaigns.organization_id AND role = 'admin'));

CREATE POLICY "Org members can view campaign queue" ON campaign_queue 
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = campaign_queue.organization_id));

CREATE POLICY "Admins can manage campaign queue" ON campaign_queue 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = campaign_queue.organization_id AND role = 'admin'));
