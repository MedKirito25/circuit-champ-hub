import { supabase } from "@/integrations/supabase/client";

// Types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Division {
  id: number;
  name: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  category_id: number | null;
  division_id: number | null;
  logo_url: string | null;
  robot_photo_url: string | null;
  team_photo_url: string | null;
  robot_name: string | null;
  robot_description: string | null;
  wins: number;
  losses: number;
  is_qualified: boolean;
  is_eliminated: boolean;
  rank_position: number | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  division?: Division;
}

export interface Match {
  id: string;
  category_id: number | null;
  division_id: number | null;
  round_name: string | null;
  round_number: number;
  match_number: number;
  team1_id: string | null;
  team2_id: string | null;
  winner_id: string | null;
  status: string;
  match_date: string | null;
  group_id: string | null;
  group_number: number | null;
  stage_number: number | null;
  created_at: string;
  updated_at: string;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  category?: Category;
  division?: Division;
}

// Queries
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id");
  
  if (error) throw error;
  return data || [];
}

export async function getDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from("divisions")
    .select("*")
    .order("id");
  
  if (error) throw error;
  return data || [];
}

export async function getTeams(categoryId?: number, divisionId?: number): Promise<Team[]> {
  let query = supabase
    .from("teams")
    .select(`
      *,
      category:categories(*),
      division:divisions(*)
    `)
    .order("wins", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (divisionId) {
    query = query.eq("division_id", divisionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTeamById(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      category:categories(*),
      division:divisions(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getMatches(categoryId?: number, divisionId?: number, status?: string): Promise<Match[]> {
  let query = supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*),
      winner:teams!matches_winner_id_fkey(*),
      category:categories(*),
      division:divisions(*)
    `)
    .order("round_number")
    .order("match_number");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (divisionId) {
    query = query.eq("division_id", divisionId);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTeamMatches(teamId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*),
      winner:teams!matches_winner_id_fkey(*),
      category:categories(*),
      division:divisions(*)
    `)
    .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Admin mutations
export async function createTeam(team: {
  name: string;
  category_id: number;
  division_id: number;
  robot_name?: string;
  robot_description?: string;
}): Promise<Team> {
  const { data, error } = await supabase
    .from("teams")
    .insert([team])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createMatch(match: {
  category_id: number;
  division_id: number;
  round_name?: string;
  round_number: number;
  match_number: number;
  team1_id: string;
  team2_id: string;
  status?: string;
}): Promise<Match> {
  const { data, error } = await supabase
    .from("matches")
    .insert([match])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMatchResult(matchId: string, winnerId: string): Promise<void> {
  // Get match details
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError) throw matchError;

  const loserId = winnerId === match.team1_id ? match.team2_id : match.team1_id;

  // Update match
  const { error: updateMatchError } = await supabase
    .from("matches")
    .update({ winner_id: winnerId, status: "completed" })
    .eq("id", matchId);

  if (updateMatchError) throw updateMatchError;

  // Get current winner stats and update
  const { data: winner } = await supabase
    .from("teams")
    .select("wins")
    .eq("id", winnerId)
    .single();

  if (winner) {
    await supabase
      .from("teams")
      .update({ wins: winner.wins + 1 })
      .eq("id", winnerId);
  }

  // Get current loser stats and update
  if (loserId) {
    const { data: loser } = await supabase
      .from("teams")
      .select("losses")
      .eq("id", loserId)
      .single();

    if (loser) {
      await supabase
        .from("teams")
        .update({ losses: loser.losses + 1, is_eliminated: true })
        .eq("id", loserId);
    }
  }
}

export async function deleteAllMatches(categoryId: number, divisionId: number): Promise<void> {
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("category_id", categoryId)
    .eq("division_id", divisionId);

  if (error) throw error;
}

export async function generateBracket(categoryId: number, divisionId: number): Promise<void> {
  // Get teams
  const teams = await getTeams(categoryId, divisionId);
  
  if (teams.length < 2) {
    throw new Error("Need at least 2 teams to generate bracket");
  }

  // Delete existing matches
  await deleteAllMatches(categoryId, divisionId);

  // Shuffle teams
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  // Create Round 1 matches
  let matchNumber = 1;
  for (let i = 0; i < shuffledTeams.length; i += 2) {
    if (shuffledTeams[i + 1]) {
      await createMatch({
        category_id: categoryId,
        division_id: divisionId,
        round_name: "Round 1",
        round_number: 1,
        match_number: matchNumber,
        team1_id: shuffledTeams[i].id,
        team2_id: shuffledTeams[i + 1].id,
        status: "pending",
      });
      matchNumber++;
    }
  }
}
