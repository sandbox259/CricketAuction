-- Drop the existing function first
DROP FUNCTION IF EXISTS get_team_summary();

-- Recreate the function with updated return type including team leadership fields
CREATE OR REPLACE FUNCTION get_team_summary()
RETURNS TABLE (
  team_id INTEGER,
  team_name VARCHAR(100),
  budget NUMERIC(12,2),
  budget_used NUMERIC(12,2),
  budget_remaining NUMERIC(12,2),
  player_count BIGINT,
  logo TEXT,
  owner_name VARCHAR(100),
  owner_image TEXT,
  captain_name VARCHAR(100),
  captain_image TEXT,
  vice_captain_name VARCHAR(100),
  vice_captain_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    t.budget,
    COALESCE(SUM(a.amount), 0) as budget_used,
    t.budget - COALESCE(SUM(a.amount), 0) as budget_remaining,
    -- Count includes captain and vice-captain (but not owner)
    COALESCE(COUNT(a.player_id), 0) + 
    CASE WHEN t.captain_name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN t.vice_captain_name IS NOT NULL THEN 1 ELSE 0 END as player_count,
    t.logo,
    t.owner_name,
    t.owner_image,
    t.captain_name,
    t.captain_image,
    t.vice_captain_name,
    t.vice_captain_image
  FROM teams t
  LEFT JOIN assignments a ON t.id = a.team_id
  GROUP BY t.id, t.name, t.budget, t.logo, t.owner_name, t.owner_image, 
           t.captain_name, t.captain_image, t.vice_captain_name, t.vice_captain_image
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql;
