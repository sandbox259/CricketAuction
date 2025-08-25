-- Update get_team_summary function to include team logo and owner information
CREATE OR REPLACE FUNCTION get_team_summary(p_team_id INTEGER)
RETURNS TABLE (
  team_id INTEGER,
  team_name VARCHAR,
  budget NUMERIC,
  total_spent NUMERIC,
  players_count BIGINT,
  players JSON,
  logo VARCHAR,
  owner_name VARCHAR,
  owner_image VARCHAR,
  captain_name VARCHAR,
  captain_image VARCHAR,
  vice_captain_name VARCHAR,
  vice_captain_image VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    t.budget,
    COALESCE(SUM(a.final_price), 0) as total_spent,
    COUNT(a.player_id) as players_count,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', p.id,
          'name', p.name,
          'position', p.position,
          'final_price', a.final_price,
          'image', p.image,
          'achievement', p.achievement
        )
      ) FILTER (WHERE p.id IS NOT NULL), 
      '[]'::json
    ) as players,
    t.logo,
    t.owner_name,
    t.owner_image,
    t.captain_name,
    t.captain_image,
    t.vice_captain_name,
    t.vice_captain_image
  FROM teams t
  LEFT JOIN assignments a ON t.id = a.team_id
  LEFT JOIN players p ON a.player_id = p.id
  WHERE t.id = p_team_id
  GROUP BY t.id, t.name, t.budget, t.logo, t.owner_name, t.owner_image, t.captain_name, t.captain_image, t.vice_captain_name, t.vice_captain_image;
END;
$$ LANGUAGE plpgsql;
