WITH [
       'Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech', 'Hooli',
       'Pied Piper', 'Vehement Capital Partners', 'Massive Dynamic', 'Wonka Industries',
       'Stark Industries', 'Wayne Enterprises', 'Umbrella Corporation', 'Vandelay Industries',
       'Bluth Company', 'OsCorp', 'Nakatomi Trading Corp', 'Tyrell Corporation',
       'Cyberdyne Systems', 'Weyland-Yutani', 'Choam Corporation', 'Sirius Cybernetics Corporation',
       'MomCorp', 'Virtucon', 'Zorin Industries', 'Krusty Krab', 'Duff Beer',
       'Gekko & Co', 'Gringotts', 'Daily Planet', 'The Leaky Cauldron', 'Blade Runner'
     ] AS names
MATCH (c:Customer)
  WHERE c.name IS NULL OR c.name = ''
WITH c, names, rand() AS r
  ORDER BY r
SET c.name = names[toInteger(r * size(names))]
