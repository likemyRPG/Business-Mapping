// Standardize location names for Customers
MATCH (c:Customer)
SET c.location = CASE c.location
  WHEN 'Silicon Valley' THEN 'California, USA'
  WHEN 'New York' THEN 'New York, USA'
  WHEN 'Boston' THEN 'Massachusetts, USA'
  WHEN 'Brussels' THEN 'Brussels, Belgium'
  WHEN 'Antwerp' THEN 'Antwerp, Belgium'
  WHEN 'Ghent' THEN 'Ghent, Belgium'
  ELSE c.location
  END;
