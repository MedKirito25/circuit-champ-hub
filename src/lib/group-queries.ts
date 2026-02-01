import { supabase } from "@/integrations/supabase/client";
import { Team } from "./supabase-queries";

// Types
export interface Group {
  id: string;
  category_id: number | null;
  division_id: number | null;
  stage_number: number;
  group_number: number;
  group_name: string | null;
  winner_team_id: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  winner?: Team;
}

export interface GroupTeam {
  id: string;
  group_id: string;
  team_id: string;
  wins: number;
  losses: number;
  matches_played: number;
  is_winner: boolean;
  created_at: string;
  team?: Team;
}

export interface GroupWithTeams extends Group {
  group_teams: GroupTeam[];
}

// Queries
export async function getGroups(categoryId?: number, divisionId?: number, stageNumber?: number): Promise<Group[]> {
  let query = supabase
    .from("groups")
    .select(`
      *,
      winner:teams!groups_winner_team_id_fkey(*)
    `)
    .order("stage_number")
    .order("group_number");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (divisionId) {
    query = query.eq("division_id", divisionId);
  }
  if (stageNumber) {
    query = query.eq("stage_number", stageNumber);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getGroupTeams(groupId: string): Promise<GroupTeam[]> {
  const { data, error } = await supabase
    .from("group_teams")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("group_id", groupId)
    .order("wins", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getGroupsWithTeams(categoryId?: number, divisionId?: number): Promise<GroupWithTeams[]> {
  const groups = await getGroups(categoryId, divisionId);
  
  const groupsWithTeams = await Promise.all(
    groups.map(async (group) => {
      const group_teams = await getGroupTeams(group.id);
      return { ...group, group_teams };
    })
  );
  
  return groupsWithTeams;
}

export async function getCurrentStage(categoryId: number, divisionId: number): Promise<number> {
  const { data, error } = await supabase
    .from("groups")
    .select("stage_number")
    .eq("category_id", categoryId)
    .eq("division_id", divisionId)
    .order("stage_number", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.stage_number || 0;
}

// Mutations
export async function generateGroupStage(categoryId: number, divisionId: number): Promise<void> {
  // Get all teams for this category/division
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("category_id", categoryId)
    .eq("division_id", divisionId)
    .eq("is_eliminated", false);

  if (teamsError) throw teamsError;

  if (!teams || teams.length < 2) {
    throw new Error("Need at least 2 teams to generate groups");
  }

  // Delete existing groups and matches for this category/division
  await deleteAllGroups(categoryId, divisionId);

  // Shuffle teams
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  // Category 1 (Suiveur) uses groups of 2, Category 2 (Tout Terrain) uses groups of 5
  const groupSize = categoryId === 1 ? 2 : 5;
  const numGroups = Math.ceil(shuffledTeams.length / groupSize);

  // Create groups and assign teams
  let teamIndex = 0;
  for (let g = 0; g < numGroups; g++) {
    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        category_id: categoryId,
        division_id: divisionId,
        stage_number: 1,
        group_number: g + 1,
        group_name: `Group ${String.fromCharCode(65 + g)}`, // A, B, C, etc.
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Assign teams to group
    const teamsInGroup = shuffledTeams.slice(teamIndex, Math.min(teamIndex + groupSize, shuffledTeams.length));
    
    for (const team of teamsInGroup) {
      const { error: gtError } = await supabase
        .from("group_teams")
        .insert({
          group_id: group.id,
          team_id: team.id,
        });

      if (gtError) throw gtError;
    }

    // Create matches within group (each team plays once against one other team)
    // For a group, we create ceil(teamsInGroup.length / 2) matches
    for (let i = 0; i < teamsInGroup.length; i += 2) {
      if (teamsInGroup[i + 1]) {
        const { error: matchError } = await supabase
          .from("matches")
          .insert({
            category_id: categoryId,
            division_id: divisionId,
            group_id: group.id,
            group_number: g + 1,
            stage_number: 1,
            round_name: `Group ${String.fromCharCode(65 + g)}`,
            round_number: 1,
            match_number: Math.floor(i / 2) + 1,
            team1_id: teamsInGroup[i].id,
            team2_id: teamsInGroup[i + 1].id,
            status: "pending",
          });

        if (matchError) throw matchError;
      }
    }

    teamIndex += groupSize;
  }

  // Reset team stats
  for (const team of teams) {
    await supabase
      .from("teams")
      .update({ wins: 0, losses: 0, is_eliminated: false })
      .eq("id", team.id);
  }
}

export async function setGroupWinner(groupId: string, winnerId: string): Promise<void> {
  // Update group with winner
  const { error: groupError } = await supabase
    .from("groups")
    .update({ 
      winner_team_id: winnerId, 
      is_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", groupId);

  if (groupError) throw groupError;

  // Mark winner in group_teams
  await supabase
    .from("group_teams")
    .update({ is_winner: false })
    .eq("group_id", groupId);

  await supabase
    .from("group_teams")
    .update({ is_winner: true })
    .eq("group_id", groupId)
    .eq("team_id", winnerId);

  // Eliminate other teams in the group
  const { data: groupTeams } = await supabase
    .from("group_teams")
    .select("team_id")
    .eq("group_id", groupId);

  if (groupTeams) {
    for (const gt of groupTeams) {
      if (gt.team_id !== winnerId) {
        await supabase
          .from("teams")
          .update({ is_eliminated: true })
          .eq("id", gt.team_id);
      }
    }
  }
}

export async function advanceToNextStage(categoryId: number, divisionId: number): Promise<{ advanced: boolean; message: string }> {
  // Get current stage
  const currentStage = await getCurrentStage(categoryId, divisionId);
  
  // Get all groups from current stage
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .eq("category_id", categoryId)
    .eq("division_id", divisionId)
    .eq("stage_number", currentStage);

  if (groupsError) throw groupsError;

  if (!groups || groups.length === 0) {
    return { advanced: false, message: "No groups found for current stage" };
  }

  // Check if all groups are completed
  const incompleteGroups = groups.filter(g => !g.is_completed);
  if (incompleteGroups.length > 0) {
    return { advanced: false, message: `${incompleteGroups.length} group(s) still need a winner selected` };
  }

  // Get all winners
  const winners = groups
    .filter(g => g.winner_team_id)
    .map(g => g.winner_team_id as string);

  if (winners.length === 1) {
    // Tournament is over - we have a champion!
    return { advanced: false, message: "🏆 Tournament complete! Champion has been crowned!" };
  }

  if (winners.length === 0) {
    return { advanced: false, message: "No winners to advance" };
  }

  // Create next stage groups
  const nextStage = currentStage + 1;
  // Category 1 (Suiveur) uses groups of 2, Category 2 (Tout Terrain) uses groups of 5
  const groupSize = categoryId === 1 ? 2 : 5;
  const numGroups = Math.ceil(winners.length / groupSize);

  // Shuffle winners
  const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);

  let teamIndex = 0;
  for (let g = 0; g < numGroups; g++) {
    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        category_id: categoryId,
        division_id: divisionId,
        stage_number: nextStage,
        group_number: g + 1,
        group_name: `Stage ${nextStage} - Group ${String.fromCharCode(65 + g)}`,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Assign winners to group
    const teamsInGroup = shuffledWinners.slice(teamIndex, Math.min(teamIndex + groupSize, shuffledWinners.length));
    
    for (const teamId of teamsInGroup) {
      const { error: gtError } = await supabase
        .from("group_teams")
        .insert({
          group_id: group.id,
          team_id: teamId,
        });

      if (gtError) throw gtError;
    }

    // Create matches within group
    for (let i = 0; i < teamsInGroup.length; i += 2) {
      if (teamsInGroup[i + 1]) {
        const { error: matchError } = await supabase
          .from("matches")
          .insert({
            category_id: categoryId,
            division_id: divisionId,
            group_id: group.id,
            group_number: g + 1,
            stage_number: nextStage,
            round_name: `Stage ${nextStage} - Group ${String.fromCharCode(65 + g)}`,
            round_number: nextStage,
            match_number: Math.floor(i / 2) + 1,
            team1_id: teamsInGroup[i],
            team2_id: teamsInGroup[i + 1],
            status: "pending",
          });

        if (matchError) throw matchError;
      }
    }

    teamIndex += groupSize;
  }

  return { advanced: true, message: `Advanced ${winners.length} winners to Stage ${nextStage}` };
}

export async function deleteAllGroups(categoryId: number, divisionId: number): Promise<void> {
  // Delete matches with group_id for this category/division
  await supabase
    .from("matches")
    .delete()
    .eq("category_id", categoryId)
    .eq("division_id", divisionId);

  // Delete groups (this will cascade to group_teams)
  await supabase
    .from("groups")
    .delete()
    .eq("category_id", categoryId)
    .eq("division_id", divisionId);
}

export async function getMatchesByGroup(groupId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*),
      winner:teams!matches_winner_id_fkey(*)
    `)
    .eq("group_id", groupId)
    .order("match_number");

  if (error) throw error;
  return data || [];
}
