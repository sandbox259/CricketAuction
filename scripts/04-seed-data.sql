-- Seed data for Live Cricket Auction

-- Insert sample teams
INSERT INTO teams (name, budget) VALUES
('Mumbai Indians', 90000000.00),
('Chennai Super Kings', 90000000.00),
('Royal Challengers Bangalore', 90000000.00),
('Kolkata Knight Riders', 90000000.00),
('Delhi Capitals', 90000000.00),
('Punjab Kings', 90000000.00),
('Rajasthan Royals', 90000000.00),
('Sunrisers Hyderabad', 90000000.00)
ON CONFLICT (name) DO NOTHING;

-- Insert sample players
INSERT INTO players (name, position, base_price) VALUES
('Virat Kohli', 'Batsman', 20000000.00),
('Rohit Sharma', 'Batsman', 16000000.00),
('MS Dhoni', 'Wicket-keeper', 12000000.00),
('Jasprit Bumrah', 'Bowler', 12000000.00),
('Hardik Pandya', 'All-rounder', 15000000.00),
('Ravindra Jadeja', 'All-rounder', 16000000.00),
('KL Rahul', 'Wicket-keeper', 17000000.00),
('Rashid Khan', 'Bowler', 15000000.00),
('Andre Russell', 'All-rounder', 12000000.00),
('David Warner', 'Batsman', 12500000.00),
('Kagiso Rabada', 'Bowler', 9250000.00),
('Jos Buttler', 'Wicket-keeper', 10000000.00),
('Trent Boult', 'Bowler', 8000000.00),
('Sunil Narine', 'All-rounder', 6000000.00),
('Shikhar Dhawan', 'Batsman', 8200000.00),
('Mohammed Shami', 'Bowler', 6250000.00),
('Rishabh Pant', 'Wicket-keeper', 16000000.00),
('Pat Cummins', 'Bowler', 15250000.00),
('Glenn Maxwell', 'All-rounder', 11000000.00),
('Yuzvendra Chahal', 'Bowler', 6500000.00);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
