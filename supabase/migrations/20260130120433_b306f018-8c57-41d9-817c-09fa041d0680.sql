-- Create categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create divisions table  
CREATE TABLE public.divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  division_id INTEGER REFERENCES public.divisions(id) ON DELETE SET NULL,
  logo_url VARCHAR(500),
  robot_photo_url VARCHAR(500),
  team_photo_url VARCHAR(500),
  robot_name VARCHAR(255),
  robot_description TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  is_qualified BOOLEAN DEFAULT FALSE,
  is_eliminated BOOLEAN DEFAULT FALSE,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, category_id, division_id)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
  division_id INTEGER REFERENCES public.divisions(id) ON DELETE CASCADE,
  round_name VARCHAR(100),
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  match_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_teams_category_division ON public.teams(category_id, division_id);
CREATE INDEX idx_teams_wins ON public.teams(wins DESC);
CREATE INDEX idx_matches_category_division ON public.matches(category_id, division_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_round ON public.matches(round_number, match_number);

-- Insert default categories
INSERT INTO public.categories (id, name, description) VALUES 
(1, 'Robot Suiveur', 'Line Follower Robot Competition - Robots that follow a black line on a white surface'),
(2, 'Robot Tout Terrain', 'All-Terrain Robot Competition - Robots designed for rough terrain navigation');

-- Insert default divisions
INSERT INTO public.divisions (id, name) VALUES 
(1, 'Junior'),
(2, 'Adult');

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view tournament data)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view divisions" ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);

-- Admin write policies (authenticated users can manage)
CREATE POLICY "Authenticated users can insert teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update teams" ON public.teams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete teams" ON public.teams FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update matches" ON public.matches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete matches" ON public.matches FOR DELETE TO authenticated USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();