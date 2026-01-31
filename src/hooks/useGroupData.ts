import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  getGroups, 
  getGroupsWithTeams, 
  getCurrentStage,
  GroupWithTeams,
  Group 
} from "@/lib/group-queries";

export function useGroups(categoryId?: number, divisionId?: number, stageNumber?: number) {
  return useQuery<Group[]>({
    queryKey: ["groups", categoryId, divisionId, stageNumber],
    queryFn: () => getGroups(categoryId, divisionId, stageNumber),
    staleTime: 1000 * 10,
  });
}

export function useGroupsWithTeams(categoryId?: number, divisionId?: number) {
  return useQuery<GroupWithTeams[]>({
    queryKey: ["groupsWithTeams", categoryId, divisionId],
    queryFn: () => getGroupsWithTeams(categoryId, divisionId),
    staleTime: 1000 * 10,
  });
}

export function useCurrentStage(categoryId: number, divisionId: number) {
  return useQuery<number>({
    queryKey: ["currentStage", categoryId, divisionId],
    queryFn: () => getCurrentStage(categoryId, divisionId),
    staleTime: 1000 * 10,
  });
}

export function useRealtimeGroups() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const groupsChannel = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
          queryClient.invalidateQueries({ queryKey: ["currentStage"] });
        }
      )
      .subscribe();

    const groupTeamsChannel = supabase
      .channel("group-teams-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_teams" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(groupTeamsChannel);
    };
  }, [queryClient]);
}
