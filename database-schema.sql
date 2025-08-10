-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  goal TEXT NOT NULL,
  domain TEXT NOT NULL,
  personalized_plan TEXT,
  nurture_sequence TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups (redundant with UNIQUE but explicit)
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own leads
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.email() = email);

-- Create policy to allow authenticated users to insert leads
CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to update their own leads
CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.email() = email);

-- Create policy to allow service role to access all leads (for admin functions)
CREATE POLICY "Service role can access all leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
