-- Atomic server-side functions for Live Cricket Auction

-- Function to assign player to team (atomic transaction)
CREATE OR REPLACE FUNCTION assign_player_to_team(
    p_player_id INTEGER,
    p_team_id INTEGER,
    p_final_price DECIMAL(10,2)
)
RETURNS JSON AS $$
DECLARE
    v_team_budget DECIMAL(12,2);
    v_player_status VARCHAR(20);
    v_result JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- Lock the team and player rows
        SELECT budget INTO v_team_budget 
        FROM teams 
        WHERE id = p_team_id 
        FOR UPDATE;
        
        SELECT status INTO v_player_status 
        FROM players 
        WHERE id = p_player_id 
        FOR UPDATE;
        
        -- Validate team exists and has sufficient budget
        IF v_team_budget IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Team not found');
        END IF;
        
        IF v_team_budget < p_final_price THEN
            RETURN json_build_object('success', false, 'error', 'Insufficient budget');
        END IF;
        
        -- Validate player exists and is available
        IF v_player_status IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Player not found');
        END IF;
        
        IF v_player_status != 'available' THEN
            RETURN json_build_object('success', false, 'error', 'Player not available');
        END IF;
        
        -- Update player status and current price
        UPDATE players 
        SET status = 'sold', current_price = p_final_price 
        WHERE id = p_player_id;
        
        -- Update team budget
        UPDATE teams 
        SET budget = budget - p_final_price 
        WHERE id = p_team_id;
        
        -- Create assignment record
        INSERT INTO assignments (player_id, team_id, final_price)
        VALUES (p_player_id, p_team_id, p_final_price);
        
        -- Create ledger entry
        INSERT INTO ledger (team_id, player_id, transaction_type, amount, description)
        VALUES (p_team_id, p_player_id, 'debit', p_final_price, 
                'Player purchase: ' || (SELECT name FROM players WHERE id = p_player_id));
        
        v_result := json_build_object(
            'success', true,
            'message', 'Player assigned successfully',
            'remaining_budget', (SELECT budget FROM teams WHERE id = p_team_id)
        );
        
        RETURN v_result;
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback happens automatically
        RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to mark player as unsold
CREATE OR REPLACE FUNCTION mark_player_unsold(p_player_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_player_status VARCHAR(20);
BEGIN
    SELECT status INTO v_player_status 
    FROM players 
    WHERE id = p_player_id;
    
    IF v_player_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Player not found');
    END IF;
    
    IF v_player_status != 'available' THEN
        RETURN json_build_object('success', false, 'error', 'Player not available for marking unsold');
    END IF;
    
    UPDATE players 
    SET status = 'unsold' 
    WHERE id = p_player_id;
    
    RETURN json_build_object('success', true, 'message', 'Player marked as unsold');
END;
$$ LANGUAGE plpgsql;

-- Function to get team summary
CREATE OR REPLACE FUNCTION get_team_summary(p_team_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'team_id', t.id,
        'team_name', t.name,
        'budget', t.budget,
        'players_count', COALESCE(player_count.count, 0),
        'total_spent', COALESCE(spent.total, 0),
        'players', COALESCE(players_array.players, '[]'::json)
    ) INTO v_result
    FROM teams t
    LEFT JOIN (
        SELECT team_id, COUNT(*) as count
        FROM assignments
        WHERE team_id = p_team_id
        GROUP BY team_id
    ) player_count ON t.id = player_count.team_id
    LEFT JOIN (
        SELECT team_id, SUM(final_price) as total
        FROM assignments
        WHERE team_id = p_team_id
        GROUP BY team_id
    ) spent ON t.id = spent.team_id
    LEFT JOIN (
        SELECT team_id, json_agg(
            json_build_object(
                'id', p.id,
                'name', p.name,
                'position', p.position,
                'final_price', a.final_price
            )
        ) as players
        FROM assignments a
        JOIN players p ON a.player_id = p.id
        WHERE a.team_id = p_team_id
        GROUP BY team_id
    ) players_array ON t.id = players_array.team_id
    WHERE t.id = p_team_id;
    
    RETURN COALESCE(v_result, json_build_object('error', 'Team not found'));
END;
$$ LANGUAGE plpgsql;

-- Function to get auction overview
CREATE OR REPLACE FUNCTION get_auction_overview()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total_players', (SELECT COUNT(*) FROM players),
        'sold_players', (SELECT COUNT(*) FROM players WHERE status = 'sold'),
        'unsold_players', (SELECT COUNT(*) FROM players WHERE status = 'unsold'),
        'available_players', (SELECT COUNT(*) FROM players WHERE status = 'available'),
        'total_teams', (SELECT COUNT(*) FROM teams),
        'total_budget', (SELECT SUM(budget) FROM teams),
        'total_spent', (SELECT COALESCE(SUM(final_price), 0) FROM assignments)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
