-- Add achievement and image columns to players table
ALTER TABLE public.players 
ADD COLUMN achievement VARCHAR(255),
ADD COLUMN image VARCHAR(500);

-- Add some sample data for existing players
UPDATE public.players 
SET achievement = CASE 
  WHEN position = 'Batsman' THEN 'Best Batsman 2023'
  WHEN position = 'Bowler' THEN 'Best Bowler 2023'
  WHEN position = 'All-rounder' THEN 'Man of the Match'
  WHEN position = 'Wicket-keeper' THEN 'Best Wicket-keeper'
  ELSE 'Rising Star'
END,
image = '/placeholder.svg?height=40&width=40'
WHERE achievement IS NULL;
