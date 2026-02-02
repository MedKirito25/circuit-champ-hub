-- Create role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table to track user roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own roles
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Only admins can manage roles (bootstrapped manually)
CREATE POLICY "Admins can manage roles" 
    ON public.user_roles 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create SECURITY DEFINER function to check if user has a specific role
-- This bypasses RLS to prevent recursive checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing overly permissive policies on teams
DROP POLICY IF EXISTS "Authenticated users can insert teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON public.teams;

-- Create new admin-only policies for teams
CREATE POLICY "Only admins can insert teams" ON public.teams 
    FOR INSERT TO authenticated 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update teams" ON public.teams 
    FOR UPDATE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete teams" ON public.teams 
    FOR DELETE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive policies on matches
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON public.matches;

-- Create new admin-only policies for matches
CREATE POLICY "Only admins can insert matches" ON public.matches 
    FOR INSERT TO authenticated 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update matches" ON public.matches 
    FOR UPDATE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete matches" ON public.matches 
    FOR DELETE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive policies on groups
DROP POLICY IF EXISTS "Authenticated users can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON public.groups;

-- Create new admin-only policies for groups
CREATE POLICY "Only admins can insert groups" ON public.groups 
    FOR INSERT TO authenticated 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update groups" ON public.groups 
    FOR UPDATE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete groups" ON public.groups 
    FOR DELETE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive policies on group_teams
DROP POLICY IF EXISTS "Authenticated users can insert group_teams" ON public.group_teams;
DROP POLICY IF EXISTS "Authenticated users can update group_teams" ON public.group_teams;
DROP POLICY IF EXISTS "Authenticated users can delete group_teams" ON public.group_teams;

-- Create new admin-only policies for group_teams
CREATE POLICY "Only admins can insert group_teams" ON public.group_teams 
    FOR INSERT TO authenticated 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update group_teams" ON public.group_teams 
    FOR UPDATE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete group_teams" ON public.group_teams 
    FOR DELETE TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));