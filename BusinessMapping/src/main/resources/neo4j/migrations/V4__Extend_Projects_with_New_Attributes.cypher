// Add 'impact' attribute to Projects
MATCH (p:Project)
SET p.impact = CASE
  WHEN p.budget > 500000 THEN 'High'
  WHEN p.budget > 250000 THEN 'Medium'
  ELSE 'Low'
  END;
