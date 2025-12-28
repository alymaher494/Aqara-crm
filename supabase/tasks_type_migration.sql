-- Add type column to tasks table for color coding
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type text DEFAULT 'call';

-- Update existing tasks to have a default type if needed
UPDATE tasks SET type = 'call' WHERE type IS NULL;

-- Enable RLS for tasks if not already enabled (sanity check)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Ensure org members can see their own org's tasks
DROP POLICY IF EXISTS "Org members view tasks" ON tasks;
CREATE POLICY "Org members view tasks" ON tasks FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = tasks.organization_id)
);

-- Ensure org members can manage their own org's tasks
DROP POLICY IF EXISTS "Org members manage tasks" ON tasks;
CREATE POLICY "Org members manage tasks" ON tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = tasks.organization_id)
);
