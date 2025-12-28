-- Add summary column to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS summary text;
