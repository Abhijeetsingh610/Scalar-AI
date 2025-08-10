-- Add new assessment fields to leads table for user career assessments
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS job_role TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS preferred_tech_stack TEXT[],
ADD COLUMN IF NOT EXISTS career_goals TEXT,
ADD COLUMN IF NOT EXISTS current_challenges TEXT,
ADD COLUMN IF NOT EXISTS learning_preference TEXT,
ADD COLUMN IF NOT EXISTS technical_skills TEXT,
ADD COLUMN IF NOT EXISTS project_interests TEXT,
ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'initial',
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Create index on assessment_type for filtering
CREATE INDEX IF NOT EXISTS idx_leads_assessment_type ON leads(assessment_type);

-- Update RLS policies to handle user_id based access
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert leads" ON leads; 
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;

-- Create new policies that work with both email and user_id
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.email() = email OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.email() = email OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.email() = email OR
    auth.role() = 'service_role'
  );
