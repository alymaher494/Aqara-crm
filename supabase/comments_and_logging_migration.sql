-- Add split comment columns to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_comment text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_comment text;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL, -- 'call_attempt', 'whatsapp_opened', 'note_added', 'status_changed', etc.
    description text
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Activity Logs Policies
CREATE POLICY "Users view own org activity logs" ON activity_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND organization_id = activity_logs.organization_id
        )
    );

CREATE POLICY "Users insert own org activity logs" ON activity_logs 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND organization_id = activity_logs.organization_id
        )
    );
