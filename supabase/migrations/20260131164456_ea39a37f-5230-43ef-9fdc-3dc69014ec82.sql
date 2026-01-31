-- Add group support to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS group_id UUID,
ADD COLUMN IF NOT EXISTS group_number INTEGER,
ADD COLUMN IF NOT EXISTS stage_number INTEGER DEFAULT 1;

-- Create groups table to track tournament groups
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
  division_id INTEGER REFERENCES public.divisions(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL DEFAULT 1,
  group_number INTEGER NOT NULL,
  group_name VARCHAR(100),
  winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_teams junction table
CREATE TABLE IF NOT EXISTS public.group_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, team_id)
);

-- Enable RLS on groups table
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create policies for groups table
CREATE POLICY "Anyone can view groups" 
ON public.groups 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update groups" 
ON public.groups 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete groups" 
ON public.groups 
FOR DELETE 
USING (true);

-- Enable RLS on group_teams table
ALTER TABLE public.group_teams ENABLE ROW LEVEL SECURITY;

-- Create policies for group_teams table
CREATE POLICY "Anyone can view group_teams" 
ON public.group_teams 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert group_teams" 
ON public.group_teams 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update group_teams" 
ON public.group_teams 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete group_teams" 
ON public.group_teams 
FOR DELETE 
USING (true);

-- Enable realtime for groups and group_teams
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_teams;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_groups_category_division ON public.groups(category_id, division_id);
CREATE INDEX IF NOT EXISTS idx_groups_stage ON public.groups(stage_number);
CREATE INDEX IF NOT EXISTS idx_group_teams_group ON public.group_teams(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_group ON public.matches(group_id);