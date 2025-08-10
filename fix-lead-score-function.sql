-- Fix for ambiguous column reference in calculate_lead_score function

CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  lead_record RECORD;
  registration_count INTEGER;
BEGIN
  -- Get lead details
  SELECT * INTO lead_record FROM leads WHERE id = calculate_lead_score.lead_id;
  
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
  
  -- Registration activity (fixed ambiguous reference)
  SELECT COUNT(*) INTO registration_count 
  FROM masterclass_registrations 
  WHERE masterclass_registrations.lead_id = calculate_lead_score.lead_id;
  
  score := score + (registration_count * 15);
  
  -- Cap at 100
  score := LEAST(score, 100);
  
  -- Update the lead record
  UPDATE leads SET lead_score = score WHERE id = calculate_lead_score.lead_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
