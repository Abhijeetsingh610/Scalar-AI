-- Fix course enrollment duplicate prevention
-- This SQL file ensures unique course enrollments per lead

-- First, remove any existing duplicate enrollments (keep the oldest one)
DELETE FROM course_enrollments 
WHERE id NOT IN (
    SELECT DISTINCT ON (lead_id, course_id) id
    FROM course_enrollments
    ORDER BY lead_id, course_id, enrolled_at ASC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE course_enrollments 
DROP CONSTRAINT IF EXISTS unique_course_enrollment;

ALTER TABLE course_enrollments 
ADD CONSTRAINT unique_course_enrollment 
UNIQUE (lead_id, course_id);

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'unique_course_enrollment';

-- Check current enrollment status
SELECT 
    COUNT(*) as total_enrollments,
    COUNT(DISTINCT lead_id) as unique_leads,
    COUNT(DISTINCT course_id) as unique_courses
FROM course_enrollments;

COMMIT;
