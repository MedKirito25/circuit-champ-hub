import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCategories, getDivisions, getTeams, getMatches, Category, Division, Team, Match } from "@/lib/supabase-queries";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDivisions() {
  return useQuery<Division[]>({
    queryKey: ["divisions"],
    queryFn: getDivisions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTeams(categoryId?: number, divisionId?: number) {
  return useQuery<Team[]>({
    queryKey: ["teams", categoryId, divisionId],
    queryFn: () => getTeams(categoryId, divisionId),
    staleTime: 1000 * 10, // 10 seconds for live updates
  });
}

export function useMatches(categoryId?: number, divisionId?: number, status?: string) {
  return useQuery<Match[]>({
    queryKey: ["matches", categoryId, divisionId, status],
    queryFn: () => getMatches(categoryId, divisionId, status),
    staleTime: 1000 * 10, // 10 seconds for live updates
  });
}

export function useRealtimeTeams() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("teams-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["teams"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeMatches() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["matches"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
