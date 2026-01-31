import { useState, useEffect } from "react";
import { GroupWithTeams, getGroupsWithTeams, getMatchesByGroup } from "@/lib/group-queries";
import { Match } from "@/lib/supabase-queries";
import { Trophy, Users, Crown, Swords, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupStageViewProps {
  categoryId: number;
  divisionId: number;
}

export function GroupStageView({ categoryId, divisionId }: GroupStageViewProps) {
  const [groups, setGroups] = useState<GroupWithTeams[]>([]);
  const [groupMatches, setGroupMatches] = useState<Record<string, Match[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const isSuiveur = categoryId === 1;

  useEffect(() => {
    loadGroups();
  }, [categoryId, divisionId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroupsWithTeams(categoryId, divisionId);
      setGroups(data);

      // Load matches for each group
      const matchesMap: Record<string, Match[]> = {};
      for (const group of data) {
        const matches = await getMatchesByGroup(group.id);
        matchesMap[group.id] = matches;
      }
      setGroupMatches(matchesMap);

      // Set selected stage to the highest one
      if (data.length > 0) {
        const maxStage = Math.max(...data.map(g => g.stage_number));
        setSelectedStage(maxStage);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div
          className={cn(
            "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4",
            isSuiveur ? "bg-primary/20" : "bg-secondary/20"
          )}
        >
          <Trophy className={cn("w-8 h-8", isSuiveur ? "text-primary" : "text-secondary")} />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">No Groups Yet</h3>
        <p className="text-muted-foreground">
          Groups haven't been generated yet. Check back soon!
        </p>
      </div>
    );
  }

  // Get unique stages
  const stages = [...new Set(groups.map(g => g.stage_number))].sort((a, b) => a - b);
  
  // Filter groups by selected stage
  const stageGroups = groups.filter(g => g.stage_number === selectedStage);

  // Check if there's a champion
  const champion = groups.find(g => g.is_completed && g.winner && groups.filter(gr => gr.stage_number === g.stage_number).length === 1);

  return (
    <div className="space-y-8">
      {/* Champion Banner */}
      {champion && champion.winner && (
        <div className="glass-card p-6 border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-12 h-12 text-yellow-500 animate-pulse" />
            <div className="text-center">
              <p className="text-sm text-yellow-500/80 font-medium uppercase tracking-wider">Tournament Champion</p>
              <h2 className="font-display text-3xl font-bold text-yellow-500">
                {champion.winner.name}
              </h2>
            </div>
            <Crown className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Stage Selector */}
      {stages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
                selectedStage === stage
                  ? isSuiveur
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              Stage {stage}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className={cn("w-6 h-6", isSuiveur ? "text-primary" : "text-secondary")} />
        <h2 className="font-display font-bold text-2xl">
          {stages.length === 1 ? "Group Stage" : `Stage ${selectedStage}`}
        </h2>
        <span
          className={cn(
            "ml-auto px-3 py-1 rounded-full text-sm font-medium",
            isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
          )}
        >
          {stageGroups.length} Group{stageGroups.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stageGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            matches={groupMatches[group.id] || []}
            isSuiveur={isSuiveur}
          />
        ))}
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: GroupWithTeams;
  matches: Match[];
  isSuiveur: boolean;
}

function GroupCard({ group, matches, isSuiveur }: GroupCardProps) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Group Header */}
      <div
        className={cn(
          "p-4 border-b border-border/30",
          isSuiveur ? "bg-primary/10" : "bg-secondary/10"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
              )}
            >
              {group.group_name?.charAt(group.group_name.length - 1) || group.group_number}
            </div>
            <h3 className="font-display font-semibold text-lg">{group.group_name}</h3>
          </div>
          {group.is_completed && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              <CheckCircle className="w-3 h-3" />
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Teams List */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Teams</p>
        {group.group_teams.map((gt) => (
          <div
            key={gt.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-colors",
              gt.is_winner
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-muted/30 hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
              )}
            >
              {gt.team?.logo_url ? (
                <img
                  src={gt.team.logo_url}
                  alt={gt.team.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                gt.team?.name?.charAt(0) || "?"
              )}
            </div>
            <span className="font-medium flex-1 truncate text-sm">
              {gt.team?.name || "Unknown"}
            </span>
            {gt.is_winner && (
              <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
            )}
            <span className="text-xs text-muted-foreground">
              {gt.wins}W - {gt.losses}L
            </span>
          </div>
        ))}
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <div className="p-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Matches</p>
          <div className="space-y-2">
            {matches.map((match) => (
              <div
                key={match.id}
                className={cn(
                  "p-2 rounded-lg",
                  match.status === "completed" ? "bg-muted/20" : "bg-muted/40"
                )}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "font-medium flex-1 truncate",
                      match.winner_id === match.team1_id && "text-green-400"
                    )}
                  >
                    {match.team1?.name || "TBD"}
                  </span>
                  <Swords className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span
                    className={cn(
                      "font-medium flex-1 truncate text-right",
                      match.winner_id === match.team2_id && "text-green-400"
                    )}
                  >
                    {match.team2?.name || "TBD"}
                  </span>
                  {match.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winner Display */}
      {group.is_completed && group.winner && (
        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-transparent border-t border-yellow-500/30">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-xs text-yellow-500/80">Group Winner</p>
              <p className="font-display font-bold text-yellow-500">{group.winner.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
