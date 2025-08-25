-- Enable Realtime for all auction tables
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE ledger;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Create a function to broadcast auction events
CREATE OR REPLACE FUNCTION broadcast_auction_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to the auction_events channel
  PERFORM pg_notify(
    'auction_events',
    json_build_object(
      'table', TG_TABLE_NAME,
      'action', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', NOW()
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add triggers for real-time notifications
CREATE TRIGGER auction_events_players
  AFTER INSERT OR UPDATE OR DELETE ON players
  FOR EACH ROW EXECUTE FUNCTION broadcast_auction_event();

CREATE TRIGGER auction_events_assignments
  AFTER INSERT OR UPDATE OR DELETE ON assignments
  FOR EACH ROW EXECUTE FUNCTION broadcast_auction_event();

CREATE TRIGGER auction_events_teams
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION broadcast_auction_event();

CREATE TRIGGER auction_events_ledger
  AFTER INSERT OR UPDATE OR DELETE ON ledger
  FOR EACH ROW EXECUTE FUNCTION broadcast_auction_event();
