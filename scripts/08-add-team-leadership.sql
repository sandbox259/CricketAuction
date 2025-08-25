-- Add team leadership and logo columns to teams table
ALTER TABLE teams 
ADD COLUMN owner_name VARCHAR(100),
ADD COLUMN owner_image TEXT,
ADD COLUMN captain_name VARCHAR(100),
ADD COLUMN captain_image TEXT,
ADD COLUMN vice_captain_name VARCHAR(100),
ADD COLUMN vice_captain_image TEXT,
ADD COLUMN team_logo TEXT;

-- Update existing teams with sample data (optional)
UPDATE teams SET 
  owner_name = 'Team Owner',
  owner_image = '/placeholder.svg?height=80&width=80',
  captain_name = 'Team Captain',
  captain_image = '/placeholder.svg?height=80&width=80',
  vice_captain_name = 'Vice Captain',
  vice_captain_image = '/placeholder.svg?height=80&width=80',
  team_logo = '/placeholder.svg?height=120&width=160'
WHERE id IS NOT NULL;
