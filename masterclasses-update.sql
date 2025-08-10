-- Add missing columns to existing masterclasses table
ALTER TABLE masterclasses 
ADD COLUMN IF NOT EXISTS instructor_name TEXT,
ADD COLUMN IF NOT EXISTS instructor_title TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;

-- Update existing records to split instructor field (if you have existing data)
UPDATE masterclasses 
SET 
  instructor_name = CASE 
    WHEN instructor LIKE '%-%' THEN TRIM(SPLIT_PART(instructor, '-', 1))
    ELSE instructor
  END,
  instructor_title = CASE 
    WHEN instructor LIKE '%-%' THEN TRIM(SPLIT_PART(instructor, '-', 2))
    ELSE 'Instructor'
  END
WHERE instructor_name IS NULL;

-- Drop the old instructor column (optional - only if you want to clean up)
-- ALTER TABLE masterclasses DROP COLUMN IF EXISTS instructor;

-- Insert sample masterclasses data
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
