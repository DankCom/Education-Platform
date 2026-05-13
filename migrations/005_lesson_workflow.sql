-- Add workflow JSON path to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS workflow_path TEXT;
