import { useState, useEffect } from "react";
import { GroupWithTeams, getGroupsWithTeams } from "@/lib/group-queries";
import { Trophy, Crown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TournamentBracketViewProps {
  categoryId: number;
  divisionId: number;
}

export function TournamentBracketView({ categoryId, divisionId }: TournamentBracketViewProps) {
  const [groups, setGroups] = useState<GroupWithTeams[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuiveur = categoryId === 1;

  useEffect(() => {
    loadGroups();
  }, [categoryId, divisionId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroupsWithTeams(categoryId, divisionId);
      setGroups(data);
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
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">Loading bracket...</p>
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
        <h3 className="font-display font-bold text-xl mb-2">No Bracket Yet</h3>
        <p className="text-muted-foreground">
          The tournament bracket hasn't been generated yet. Check back soon!
        </p>
      </div>
    );
  }

  // Get unique stages sorted
  const stages = [...new Set(groups.map(g => g.stage_number))].sort((a, b) => a - b);

  // Organize groups by stage
  const groupsByStage: Record<number, GroupWithTeams[]> = {};
  stages.forEach(stage => {
    groupsByStage[stage] = groups
      .filter(g => g.stage_number === stage)
      .sort((a, b) => a.group_number - b.group_number);
  });

  // Check if there's a champion (final stage with only 1 completed group)
  const finalStage = stages[stages.length - 1];
  const finalGroups = groupsByStage[finalStage] || [];
  const champion = finalGroups.length === 1 && finalGroups[0].is_completed ? finalGroups[0].winner : null;

  return (
    <div className="space-y-8">
      {/* Champion Banner */}
      {champion && (
        <div className="glass-card p-6 border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-12 h-12 text-yellow-500 animate-pulse" />
            <div className="text-center">
              <p className="text-sm text-yellow-500/80 font-medium uppercase tracking-wider">Tournament Champion</p>
              <h2 className="font-display text-3xl font-bold text-yellow-500">
                {champion.name}
              </h2>
            </div>
            <Crown className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Bracket Visualization */}
      <div className="glass-card p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex items-stretch gap-0">
            {stages.map((stage, stageIndex) => {
              const stageGroups = groupsByStage[stage];
              const isLastStage = stageIndex === stages.length - 1;
              const nextStageGroups = !isLastStage ? groupsByStage[stages[stageIndex + 1]] : [];
              
              return (
                <div key={stage} className="flex items-stretch">
                  {/* Stage Column */}
                  <div className="flex flex-col justify-around min-w-[200px]">
                    {/* Stage Header */}
                    <div className="text-center mb-4">
                      <span
                        className={cn(
                          "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                          isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                        )}
                      >
                        {isLastStage && stageGroups.length === 1 ? "Final" : `Stage ${stage}`}
                      </span>
                    </div>

                    {/* Groups */}
                    <div className="flex flex-col justify-around flex-1 gap-4">
                      {stageGroups.map((group) => (
                        <BracketGroupCard
                          key={group.id}
                          group={group}
                          isSuiveur={isSuiveur}
                          isFinal={isLastStage && stageGroups.length === 1}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Connector Lines */}
                  {!isLastStage && stageGroups.length > 0 && (
                    <div className="relative w-16 flex items-center justify-center">
                      <BracketConnectors
                        sourceCount={stageGroups.length}
                        targetCount={nextStageGroups.length}
                        isSuiveur={isSuiveur}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", isSuiveur ? "bg-primary" : "bg-secondary")} />
          <span>Active Groups</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span>Winner</span>
        </div>
      </div>
    </div>
  );
}

interface BracketGroupCardProps {
  group: GroupWithTeams;
  isSuiveur: boolean;
  isFinal?: boolean;
}

function BracketGroupCard({ group, isSuiveur, isFinal }: BracketGroupCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 overflow-hidden transition-all",
        group.is_completed
          ? "border-green-500/50 bg-green-500/5"
          : isSuiveur
            ? "border-primary/30 bg-primary/5"
            : "border-secondary/30 bg-secondary/5",
        isFinal && "border-yellow-500/50 bg-yellow-500/5"
      )}
    >
      {/* Group Header */}
      <div
        className={cn(
          "px-3 py-2 border-b flex items-center justify-between",
          group.is_completed
            ? "border-green-500/30 bg-green-500/10"
            : isSuiveur
              ? "border-primary/20 bg-primary/10"
              : "border-secondary/20 bg-secondary/10",
          isFinal && "border-yellow-500/30 bg-yellow-500/10"
        )}
      >
        <span className="font-display font-semibold text-sm">
          {isFinal ? "🏆 Final" : group.group_name}
        </span>
        {group.is_completed && (
          <CheckCircle className="w-4 h-4 text-green-400" />
        )}
      </div>

      {/* Teams */}
      <div className="p-2 space-y-1">
        {group.group_teams.map((gt) => (
          <div
            key={gt.id}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
              gt.is_winner
                ? "bg-yellow-500/20 border border-yellow-500/30"
                : "bg-muted/30"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0",
                isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
              )}
            >
              {gt.team?.logo_url ? (
                <img
                  src={gt.team.logo_url}
                  alt={gt.team.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                gt.team?.name?.charAt(0) || "?"
              )}
            </div>
            <span className="flex-1 truncate font-medium text-xs">
              {gt.team?.name || "TBD"}
            </span>
            {gt.is_winner && (
              <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Winner indicator */}
      {group.is_completed && group.winner && (
        <div className="px-2 pb-2">
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            <Crown className="w-3 h-3" />
            <span className="font-semibold truncate">{group.winner.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface BracketConnectorsProps {
  sourceCount: number;
  targetCount: number;
  isSuiveur: boolean;
}

function BracketConnectors({ sourceCount, targetCount, isSuiveur }: BracketConnectorsProps) {
  // Calculate SVG dimensions
  const sourceSpacing = 100;
  const targetSpacing = sourceCount > 1 ? (sourceCount * sourceSpacing) / Math.max(targetCount, 1) : sourceSpacing;
  const height = Math.max(sourceCount, 1) * sourceSpacing;
  const width = 64;

  // Generate path data for each connection
  const paths: string[] = [];
  
  for (let i = 0; i < sourceCount; i++) {
    // Calculate which target this source connects to
    const targetIndex = Math.min(Math.floor(i / Math.ceil(sourceCount / Math.max(targetCount, 1))), Math.max(targetCount - 1, 0));
    
    const sourceY = (i + 0.5) * sourceSpacing;
    const targetY = targetCount > 0 
      ? (targetIndex + 0.5) * targetSpacing + ((sourceCount - targetCount) * sourceSpacing) / 2 / Math.max(targetCount, 1)
      : height / 2;
    
    // Create a curved path
    const midX = width / 2;
    paths.push(`M 0 ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${width} ${targetY}`);
  }

  return (
    <svg
      width={width}
      height={height}
      className="block"
      style={{ minHeight: height }}
    >
      {paths.map((d, idx) => (
        <path
          key={idx}
          d={d}
          fill="none"
          stroke={isSuiveur ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
    </svg>
  );
}
