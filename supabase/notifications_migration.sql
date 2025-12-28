-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL CHECK (type IN ('info', 'warning', 'success')),
    is_read boolean DEFAULT false NOT NULL,
    link_url text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Add interested_in column to leads if it doesn't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interested_in text;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users view own notifications" ON notifications 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications 
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
