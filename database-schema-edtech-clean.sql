-- Create masterclasses table
CREATE TABLE IF NOT EXISTS masterclasses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes INTEGER NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  max_attendees INTEGER DEFAULT 1000,
  current_attendees INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table (updated for edtech)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  job_role TEXT NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('Student', '0-2 years', '2-5 years', '5+ years')),
  career_goals TEXT NOT NULL,
  preferred_tech_stack TEXT[],
  ai_career_roadmap TEXT,
  recommended_masterclasses UUID[],
  lead_score INTEGER DEFAULT 0,
  conversion_stage TEXT DEFAULT 'Cold' CHECK (conversion_stage IN ('Cold', 'Warm', 'Hot', 'Converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create masterclass_registrations table
CREATE TABLE IF NOT EXISTS masterclass_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  masterclass_id UUID REFERENCES masterclasses(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  engagement_score INTEGER DEFAULT 0,
  follow_up_sent BOOLEAN DEFAULT false,
  UNIQUE(lead_id, masterclass_id)
);

-- Course Enrollments Table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  payment_amount DECIMAL(10,2),
  enrollment_status TEXT DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'completed', 'cancelled', 'refunded')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation Bookings Table
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  consultation_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_conversion_stage ON leads(conversion_stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_masterclasses_tech_stack ON masterclasses USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_masterclasses_scheduled_date ON masterclasses(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_registrations_lead_id ON masterclass_registrations(lead_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_lead_id ON course_enrollments(lead_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(enrollment_status);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterclass_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Service role can access all leads" ON leads;
DROP POLICY IF EXISTS "Anyone can view active masterclasses" ON masterclasses;
DROP POLICY IF EXISTS "Service role can manage masterclasses" ON masterclasses;
DROP POLICY IF EXISTS "Users can view their own registrations" ON masterclass_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON masterclass_registrations;
DROP POLICY IF EXISTS "Service role can access all registrations" ON masterclass_registrations;
DROP POLICY IF EXISTS "Users can view their own consultations" ON consultation_bookings;
DROP POLICY IF EXISTS "Users can insert their own consultations" ON consultation_bookings;
DROP POLICY IF EXISTS "Service role can access all consultations" ON consultation_bookings;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Service role can access all enrollments" ON course_enrollments;

-- RLS Policies for leads
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Service role can access all leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for masterclasses (public read)
CREATE POLICY "Anyone can view active masterclasses" ON masterclasses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage masterclasses" ON masterclasses
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for registrations
CREATE POLICY "Users can view their own registrations" ON masterclass_registrations
  FOR SELECT USING (lead_id IN (SELECT id FROM leads WHERE email = auth.email()));

CREATE POLICY "Users can insert their own registrations" ON masterclass_registrations
  FOR INSERT WITH CHECK (lead_id IN (SELECT id FROM leads WHERE email = auth.email()));

CREATE POLICY "Service role can access all registrations" ON masterclass_registrations
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for consultations
CREATE POLICY "Users can view their own consultations" ON consultation_bookings
  FOR SELECT USING (lead_id IN (SELECT id FROM leads WHERE email = auth.email()));

CREATE POLICY "Users can insert their own consultations" ON consultation_bookings
  FOR INSERT WITH CHECK (lead_id IN (SELECT id FROM leads WHERE email = auth.email()));

CREATE POLICY "Service role can access all consultations" ON consultation_bookings
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for course enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
  FOR SELECT USING (lead_id IN (SELECT id FROM leads WHERE email = auth.email()));

CREATE POLICY "Users can insert their own enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (lead_id IN (SELECT id FROM leads WHERE email = auth.email()));

CREATE POLICY "Service role can access all enrollments" ON course_enrollments
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample masterclasses
INSERT INTO masterclasses (title, description, instructor, tech_stack, difficulty_level, duration_minutes, scheduled_date, tags) VALUES
(
  'Roadmap to Data Engineering Mastery',
  'Learn how to transition into data engineering with hands-on projects and industry best practices. Perfect for software engineers looking to specialize.',
  'Rahul Sharma, Senior Data Engineer at Google',
  ARRAY['Python', 'SQL', 'Apache Spark', 'AWS', 'Kafka'],
  'Intermediate',
  90,
  NOW() + INTERVAL '7 days',
  ARRAY['data-engineering', 'career-transition', 'big-data']
),
(
  'Full Stack Development Bootcamp Preview',
  'Get a taste of our comprehensive full-stack program. Build a complete app using React, Node.js, and databases in 2 hours.',
  'Priya Patel, Ex-Microsoft Senior Developer',
  ARRAY['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express'],
  'Beginner',
  120,
  NOW() + INTERVAL '3 days',
  ARRAY['full-stack', 'web-development', 'bootcamp']
),
(
  'DevOps Transformation: From Developer to DevOps Engineer',
  'Master the essential DevOps tools and practices. Learn Docker, Kubernetes, CI/CD pipelines, and cloud deployment strategies.',
  'Amit Kumar, DevOps Lead at Netflix',
  ARRAY['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform'],
  'Intermediate',
  95,
  NOW() + INTERVAL '14 days',
  ARRAY['devops', 'cloud', 'containers']
),
(
  'Machine Learning in Production: Real-World MLOps',
  'Bridge the gap between ML models and production systems. Learn model deployment, monitoring, and scaling with industry tools.',
  'Dr. Sneha Reddy, ML Engineer at OpenAI',
  ARRAY['Python', 'TensorFlow', 'Docker', 'Kubernetes', 'MLflow'],
  'Advanced',
  95,
  NOW() + INTERVAL '14 days',
  ARRAY['machine-learning', 'ai', 'mlops']
),
(
  'Mobile App Development: React Native vs Flutter',
  'Compare the top cross-platform frameworks and choose the right one for your career. Includes hands-on coding session.',
  'Vikram Singh, Mobile Architect at Uber',
  ARRAY['React Native', 'Flutter', 'Dart', 'JavaScript', 'TypeScript'],
  'Beginner',
  80,
  NOW() + INTERVAL '5 days',
  ARRAY['mobile-development', 'react-native', 'flutter']
),
(
  'AI & Machine Learning Mastery: Zero to Production',
  'Complete AI journey from fundamentals to deploying ML models in production. Build real-world AI applications with Python, TensorFlow, and cloud platforms.',
  'Dr. Sarah Chen, Former Google AI Research & Netflix ML Lead',
  ARRAY['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Docker', 'MLOps'],
  'Intermediate',
  150,
  NOW() + INTERVAL '7 days',
  ARRAY['artificial-intelligence', 'machine-learning', 'deep-learning', 'mlops']
),
(
  'Full-Stack AI Product Development',
  'Build and deploy complete AI-powered applications. Learn to create intelligent chatbots, recommendation systems, and computer vision apps that scale.',
  'Marcus Johnson, Head of AI Products at Stripe',
  ARRAY['React', 'Node.js', 'Python', 'OpenAI API', 'Vector Databases', 'Kubernetes'],
  'Advanced',
  200,
  NOW() + INTERVAL '10 days',
  ARRAY['ai-products', 'full-stack', 'product-development', 'llm-integration']
);

-- Create functions for lead scoring
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  lead_record RECORD;
  registration_count INTEGER;
BEGIN
  -- Get lead details
  SELECT * INTO lead_record FROM leads WHERE id = lead_id;
  
  -- Base scoring
  CASE lead_record.experience_level
    WHEN '0-2 years' THEN score := score + 20;
    WHEN '2-5 years' THEN score := score + 30;
    WHEN '5+ years' THEN score := score + 25;
    WHEN 'Student' THEN score := score + 15;
  END CASE;
  
  -- Career goals scoring
  IF lead_record.career_goals ILIKE '%career change%' OR 
     lead_record.career_goals ILIKE '%transition%' THEN
    score := score + 25;
  END IF;
  
  IF lead_record.career_goals ILIKE '%promotion%' OR 
     lead_record.career_goals ILIKE '%senior%' THEN
    score := score + 20;
  END IF;
  
  -- Registration activity
  SELECT COUNT(*) INTO registration_count 
  FROM masterclass_registrations 
  WHERE lead_id = lead_record.id;
  
  score := score + (registration_count * 15);
  
  -- Cap at 100
  score := LEAST(score, 100);
  
  -- Update the lead record
  UPDATE leads SET lead_score = score WHERE id = lead_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update lead score
CREATE OR REPLACE FUNCTION update_lead_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_lead_score(NEW.lead_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS masterclass_registration_score_update ON masterclass_registrations;
CREATE TRIGGER masterclass_registration_score_update
  AFTER INSERT OR UPDATE ON masterclass_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score_trigger();

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
