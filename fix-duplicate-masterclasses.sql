-- Clean up duplicate masterclasses
-- This script removes duplicate masterclass entries and ensures unique courses

-- First, let's check what duplicates we have
SELECT title, COUNT(*) as count
FROM masterclasses 
GROUP BY title 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Remove duplicates, keeping the most recent one (highest ID)
DELETE FROM masterclasses 
WHERE id NOT IN (
    SELECT DISTINCT ON (title) id
    FROM masterclasses
    ORDER BY title, id DESC
);

-- Add a unique constraint on title to prevent future duplicates
ALTER TABLE masterclasses 
DROP CONSTRAINT IF EXISTS unique_masterclass_title;

ALTER TABLE masterclasses 
ADD CONSTRAINT unique_masterclass_title 
UNIQUE (title);

-- Verify the cleanup
SELECT 
    COUNT(*) as total_masterclasses,
    COUNT(DISTINCT title) as unique_titles
FROM masterclasses
WHERE is_active = true;

-- Show the current masterclasses
SELECT 
    id,
    title,
    instructor_name,
    current_attendees,
    max_attendees,
    is_active
FROM masterclasses
WHERE is_active = true
ORDER BY scheduled_date;

COMMIT;
