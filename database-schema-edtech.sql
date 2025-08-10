-- Create masterclasses table
CREATE TABLE IF NOT EXISTS masterclasses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  instructor_title TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes INTEGER NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  max_attendees INTEGER DEFAULT 1000,
  current_attendees INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 4.5,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT true,
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
  WHERE masterclass_registrations.lead_id = calculate_lead_score.lead_id;
  
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

-- Insert sample masterclasses
INSERT INTO masterclasses (title, description, instructor_name, instructor_title, tech_stack, difficulty_level, duration_minutes, scheduled_date, max_attendees, current_attendees, rating, price, is_free, is_active, tags) VALUES
('React Mastery: Build Production-Ready Apps', 'Master React.js from fundamentals to advanced patterns. Learn hooks, context, performance optimization, and deployment strategies.', 'Sarah Chen', 'Senior Frontend Engineer at Meta', ARRAY['React', 'JavaScript', 'TypeScript', 'Next.js'], 'Intermediate', 120, '2025-08-15 18:00:00+00', 1000, 934, 4.8, 49.99, false, true, ARRAY['frontend', 'react', 'javascript']),

('Python Data Engineering Pipeline', 'Build scalable data pipelines using Python, Apache Airflow, and cloud technologies. Perfect for aspiring data engineers.', 'Dr. Michael Rodriguez', 'Principal Data Engineer at Netflix', ARRAY['Python', 'Apache Airflow', 'AWS', 'Docker'], 'Advanced', 150, '2025-08-18 19:00:00+00', 1000, 876, 4.9, 79.99, false, true, ARRAY['data-engineering', 'python', 'cloud']),

('Machine Learning for Beginners', 'Start your ML journey! Learn fundamental concepts, implement basic algorithms, and build your first predictive model.', 'Priya Sharma', 'ML Research Scientist at Google AI', ARRAY['Python', 'Scikit-learn', 'Pandas', 'Jupyter'], 'Beginner', 90, '2025-08-20 17:30:00+00', 1000, 967, 4.7, 0.00, true, true, ARRAY['machine-learning', 'python', 'data-science']),

('DevOps Fundamentals: CI/CD with Docker & Kubernetes', 'Master modern DevOps practices. Learn containerization, orchestration, and automated deployment pipelines.', 'Alex Kumar', 'DevOps Engineer at Amazon', ARRAY['Docker', 'Kubernetes', 'Jenkins', 'AWS'], 'Intermediate', 135, '2025-08-22 18:30:00+00', 1000, 912, 4.6, 59.99, false, true, ARRAY['devops', 'docker', 'kubernetes']),

('Full-Stack JavaScript: MERN Stack Deep Dive', 'Build complete web applications using MongoDB, Express.js, React, and Node.js. Include authentication and deployment.', 'Jennifer Lee', 'Full-Stack Developer at Stripe', ARRAY['MongoDB', 'Express.js', 'React', 'Node.js'], 'Intermediate', 180, '2025-08-25 16:00:00+00', 1000, 945, 4.5, 69.99, false, true, ARRAY['full-stack', 'javascript', 'mern']),

('Advanced System Design', 'Learn to design scalable, distributed systems. Cover microservices, load balancing, caching, and database scaling strategies.', 'Raj Patel', 'Principal Architect at Uber', ARRAY['System Design', 'Microservices', 'Redis', 'PostgreSQL'], 'Advanced', 200, '2025-08-28 17:00:00+00', 1000, 823, 4.9, 99.99, false, true, ARRAY['system-design', 'architecture', 'scalability']),

('iOS Development with Swift', 'Build native iOS applications from scratch. Learn SwiftUI, Core Data, networking, and App Store deployment.', 'Emily Watson', 'Senior iOS Developer at Apple', ARRAY['Swift', 'SwiftUI', 'Xcode', 'Core Data'], 'Intermediate', 160, '2025-08-30 16:30:00+00', 1000, 901, 4.7, 54.99, false, true, ARRAY['mobile', 'ios', 'swift']),

('Cybersecurity Essentials', 'Master the fundamentals of cybersecurity. Learn about threats, vulnerabilities, encryption, and security best practices.', 'David Kim', 'Security Engineer at CrowdStrike', ARRAY['Security', 'Python', 'Linux', 'Network Security'], 'Beginner', 120, '2025-09-02 18:00:00+00', 1000, 958, 4.6, 0.00, true, true, ARRAY['security', 'cybersecurity', 'ethical-hacking'])

ON CONFLICT (id) DO NOTHING;
