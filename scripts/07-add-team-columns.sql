-- Add new columns to teams table for owner, captain, vice-captain and their images, plus team logo
ALTER TABLE public.teams 
ADD COLUMN owner VARCHAR(100),
ADD COLUMN owner_image TEXT,
ADD COLUMN captain VARCHAR(100),
ADD COLUMN captain_image TEXT,
ADD COLUMN vice_captain VARCHAR(100),
ADD COLUMN vice_captain_image TEXT,
ADD COLUMN team_logo TEXT;

-- Update existing teams with sample data
UPDATE public.teams SET 
  owner = CASE 
    WHEN name = 'Mumbai Indians' THEN 'Nita Ambani'
    WHEN name = 'Chennai Super Kings' THEN 'N. Srinivasan'
    WHEN name = 'Royal Challengers Bangalore' THEN 'Vijay Mallya'
    WHEN name = 'Kolkata Knight Riders' THEN 'Shah Rukh Khan'
    WHEN name = 'Delhi Capitals' THEN 'Parth Jindal'
    WHEN name = 'Punjab Kings' THEN 'Preity Zinta'
    WHEN name = 'Rajasthan Royals' THEN 'Manoj Badale'
    WHEN name = 'Sunrisers Hyderabad' THEN 'Kavya Maran'
    ELSE 'Team Owner'
  END,
  owner_image = '/placeholder.svg?height=60&width=60',
  captain = CASE 
    WHEN name = 'Mumbai Indians' THEN 'Rohit Sharma'
    WHEN name = 'Chennai Super Kings' THEN 'MS Dhoni'
    WHEN name = 'Royal Challengers Bangalore' THEN 'Virat Kohli'
    WHEN name = 'Kolkata Knight Riders' THEN 'Shreyas Iyer'
    WHEN name = 'Delhi Capitals' THEN 'Rishabh Pant'
    WHEN name = 'Punjab Kings' THEN 'Shikhar Dhawan'
    WHEN name = 'Rajasthan Royals' THEN 'Sanju Samson'
    WHEN name = 'Sunrisers Hyderabad' THEN 'Aiden Markram'
    ELSE 'Team Captain'
  END,
  captain_image = '/placeholder.svg?height=60&width=60',
  vice_captain = CASE 
    WHEN name = 'Mumbai Indians' THEN 'Jasprit Bumrah'
    WHEN name = 'Chennai Super Kings' THEN 'Ravindra Jadeja'
    WHEN name = 'Royal Challengers Bangalore' THEN 'Glenn Maxwell'
    WHEN name = 'Kolkata Knight Riders' THEN 'Andre Russell'
    WHEN name = 'Delhi Capitals' THEN 'Axar Patel'
    WHEN name = 'Punjab Kings' THEN 'Kagiso Rabada'
    WHEN name = 'Rajasthan Royals' THEN 'Jos Buttler'
    WHEN name = 'Sunrisers Hyderabad' THEN 'Bhuvneshwar Kumar'
    ELSE 'Vice Captain'
  END,
  vice_captain_image = '/placeholder.svg?height=60&width=60',
  team_logo = '/placeholder.svg?height=80&width=120&query=' || LOWER(REPLACE(name, ' ', '+')) || '+cricket+team+logo';
