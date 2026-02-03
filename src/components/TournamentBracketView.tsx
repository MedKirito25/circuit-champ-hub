import { useState, useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Card dimensions for layout calculations
  const CARD_HEIGHT = 120;
  const CARD_WIDTH = 220;
  const CONNECTOR_WIDTH = 48;
  const VERTICAL_GAP = 16;

  // Calculate height needed for the first stage (most groups)
  const maxGroupsInStage = Math.max(...stages.map(s => groupsByStage[s]?.length || 0));
  const totalHeight = maxGroupsInStage * CARD_HEIGHT + (maxGroupsInStage - 1) * VERTICAL_GAP;

  return (
    <div className="space-y-6">
      {/* Champion Banner */}
      {champion && (
        <div className="glass-card p-6 border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
            <div className="text-center">
              <p className="text-sm text-yellow-500/80 font-medium uppercase tracking-wider">Tournament Champion</p>
              <h2 className="font-display text-2xl font-bold text-yellow-500">
                {champion.name}
              </h2>
            </div>
            <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Bracket Visualization */}
      <div className="glass-card p-6 overflow-x-auto" ref={containerRef}>
        <div 
          className="relative flex items-center"
          style={{ 
            minWidth: stages.length * (CARD_WIDTH + CONNECTOR_WIDTH) + 40,
            minHeight: totalHeight + 80
          }}
        >
          {stages.map((stage, stageIndex) => {
            const stageGroups = groupsByStage[stage];
            const isLastStage = stageIndex === stages.length - 1;
            const isFinal = isLastStage && stageGroups.length === 1;
            
            // Calculate vertical spacing for this stage
            const groupCount = stageGroups.length;
            const stageHeight = groupCount * CARD_HEIGHT + (groupCount - 1) * VERTICAL_GAP;
            const stageOffset = (totalHeight - stageHeight) / 2;

            return (
              <div 
                key={stage} 
                className="flex items-start"
                style={{ 
                  marginLeft: stageIndex === 0 ? 0 : 0 
                }}
              >
                {/* Stage Column */}
                <div 
                  className="flex flex-col relative"
                  style={{ 
                    width: CARD_WIDTH,
                    paddingTop: stageOffset + 40
                  }}
                >
                  {/* Stage Header */}
                  <div 
                    className="absolute top-0 left-0 right-0 text-center"
                    style={{ width: CARD_WIDTH }}
                  >
                    <span
                      className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                        isFinal 
                          ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                          : isSuiveur 
                            ? "bg-primary/20 text-primary border border-primary/30" 
                            : "bg-secondary/20 text-secondary border border-secondary/30"
                      )}
                    >
                      {isFinal ? "🏆 Final" : `Stage ${stage}`}
                    </span>
                  </div>

                  {/* Groups */}
                  <div 
                    className="flex flex-col"
                    style={{ gap: VERTICAL_GAP }}
                  >
                    {stageGroups.map((group) => (
                      <BracketGroupCard
                        key={group.id}
                        group={group}
                        isSuiveur={isSuiveur}
                        isFinal={isFinal}
                        height={CARD_HEIGHT}
                      />
                    ))}
                  </div>
                </div>

                {/* Connector Lines */}
                {!isLastStage && stageGroups.length > 0 && (
                  <BracketConnectors
                    sourceGroups={stageGroups}
                    targetGroups={groupsByStage[stages[stageIndex + 1]] || []}
                    cardHeight={CARD_HEIGHT}
                    verticalGap={VERTICAL_GAP}
                    totalHeight={totalHeight}
                    width={CONNECTOR_WIDTH}
                    isSuiveur={isSuiveur}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", isSuiveur ? "bg-primary" : "bg-secondary")} />
          <span>Active</span>
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
  height: number;
}

function BracketGroupCard({ group, isSuiveur, isFinal, height }: BracketGroupCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 overflow-hidden transition-all shadow-lg",
        group.is_completed
          ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-500/5"
          : isFinal
            ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5"
            : isSuiveur
              ? "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5"
              : "border-secondary/40 bg-gradient-to-br from-secondary/10 to-secondary/5"
      )}
      style={{ height, minHeight: height }}
    >
      {/* Group Header */}
      <div
        className={cn(
          "px-3 py-1.5 border-b flex items-center justify-between",
          group.is_completed
            ? "border-green-500/30 bg-green-500/20"
            : isFinal
              ? "border-yellow-500/30 bg-yellow-500/20"
              : isSuiveur
                ? "border-primary/30 bg-primary/20"
                : "border-secondary/30 bg-secondary/20"
        )}
      >
        <span className="font-display font-semibold text-xs">
          {isFinal ? "Championship" : group.group_name}
        </span>
        {group.is_completed && (
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
        )}
      </div>

      {/* Teams */}
      <div className="p-2 space-y-1 flex-1">
        {group.group_teams.slice(0, 3).map((gt) => (
          <div
            key={gt.id}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors",
              gt.is_winner
                ? "bg-yellow-500/20 border border-yellow-500/40"
                : "bg-background/30 hover:bg-background/50"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                isSuiveur ? "bg-primary/30 text-primary" : "bg-secondary/30 text-secondary"
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
            <span className="flex-1 truncate font-medium">
              {gt.team?.name || "TBD"}
            </span>
            {gt.is_winner && (
              <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
            )}
          </div>
        ))}
        {group.group_teams.length > 3 && (
          <div className="text-[10px] text-muted-foreground text-center">
            +{group.group_teams.length - 3} more
          </div>
        )}
      </div>

      {/* Winner indicator */}
      {group.is_completed && group.winner && (
        <div className="px-2 pb-1.5 border-t border-green-500/20">
          <div className="flex items-center gap-1 text-[10px] text-yellow-500">
            <Crown className="w-3 h-3" />
            <span className="font-bold truncate">{group.winner.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface BracketConnectorsProps {
  sourceGroups: GroupWithTeams[];
  targetGroups: GroupWithTeams[];
  cardHeight: number;
  verticalGap: number;
  totalHeight: number;
  width: number;
  isSuiveur: boolean;
}

function BracketConnectors({ 
  sourceGroups = [], 
  targetGroups = [], 
  cardHeight, 
  verticalGap, 
  totalHeight, 
  width,
  isSuiveur 
}: BracketConnectorsProps) {
  const sourceCount = sourceGroups?.length ?? 0;
  const targetCount = targetGroups?.length ?? 0;
  
  if (sourceCount === 0 || targetCount === 0) return null;

  // Calculate Y positions for source groups
  const sourceStageHeight = sourceCount * cardHeight + (sourceCount - 1) * verticalGap;
  const sourceOffset = (totalHeight - sourceStageHeight) / 2;
  
  // Calculate Y positions for target groups
  const targetStageHeight = targetCount * cardHeight + (targetCount - 1) * verticalGap;
  const targetOffset = (totalHeight - targetStageHeight) / 2;

  const paths: { d: string; key: string; hasWinner: boolean }[] = [];
  
  // For each source group, find which target group its winner went to
  sourceGroups.forEach((sourceGroup, sourceIndex) => {
    // Get the winner team ID from this source group
    const winnerTeamId = sourceGroup.winner_team_id;
    const hasWinner = !!winnerTeamId;
    
    if (!winnerTeamId) {
      // No winner yet - draw line to the calculated target based on position
      const sourcesPerTarget = Math.ceil(sourceCount / targetCount);
      const targetIndex = Math.min(Math.floor(sourceIndex / sourcesPerTarget), targetCount - 1);
      
      const sourceY = sourceOffset + sourceIndex * (cardHeight + verticalGap) + cardHeight / 2;
      const targetY = targetOffset + targetIndex * (cardHeight + verticalGap) + cardHeight / 2;
      
      const midX = width / 2;
      paths.push({
        d: `M 0 ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${width} ${targetY}`,
        key: `${sourceIndex}-${targetIndex}`,
        hasWinner: false
      });
      return;
    }
    
    // Find which target group contains this winner
    const targetIndex = targetGroups.findIndex(targetGroup => 
      targetGroup.group_teams.some(gt => gt.team_id === winnerTeamId)
    );
    
    if (targetIndex === -1) {
      // Winner not found in any target group - use position-based fallback
      const sourcesPerTarget = Math.ceil(sourceCount / targetCount);
      const fallbackTargetIndex = Math.min(Math.floor(sourceIndex / sourcesPerTarget), targetCount - 1);
      
      const sourceY = sourceOffset + sourceIndex * (cardHeight + verticalGap) + cardHeight / 2;
      const targetY = targetOffset + fallbackTargetIndex * (cardHeight + verticalGap) + cardHeight / 2;
      
      const midX = width / 2;
      paths.push({
        d: `M 0 ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${width} ${targetY}`,
        key: `${sourceIndex}-${fallbackTargetIndex}`,
        hasWinner: true
      });
      return;
    }
    
    // Source Y: center of the source card
    const sourceY = sourceOffset + sourceIndex * (cardHeight + verticalGap) + cardHeight / 2;
    
    // Target Y: center of the target card
    const targetY = targetOffset + targetIndex * (cardHeight + verticalGap) + cardHeight / 2;
    
    // Create curved bezier path
    const midX = width / 2;
    paths.push({
      d: `M 0 ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${width} ${targetY}`,
      key: `${sourceIndex}-${targetIndex}`,
      hasWinner: true
    });
  });

  const strokeColor = isSuiveur ? "hsl(var(--primary))" : "hsl(var(--secondary))";

  return (
    <svg
      width={width}
      height={totalHeight}
      className="flex-shrink-0"
      style={{ 
        marginTop: 40,
        overflow: "visible" 
      }}
    >
      <defs>
        <linearGradient id={`connector-gradient-${isSuiveur ? 'primary' : 'secondary'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.5} />
          <stop offset="50%" stopColor={strokeColor} stopOpacity={0.8} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.5} />
        </linearGradient>
        {/* Animated gradient for completed connections */}
        <linearGradient id={`connector-gradient-animated-${isSuiveur ? 'primary' : 'secondary'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3}>
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor={strokeColor} stopOpacity={1}>
            <animate attributeName="stop-opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.3}>
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      {paths.map(({ d, key, hasWinner }, index) => (
        <g key={key}>
          {/* Background glow for completed paths */}
          {hasWinner && (
            <path
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.2}
              className="animate-pulse"
            />
          )}
          {/* Main path */}
          <path
            d={d}
            fill="none"
            stroke={hasWinner 
              ? `url(#connector-gradient-animated-${isSuiveur ? 'primary' : 'secondary'})`
              : `url(#connector-gradient-${isSuiveur ? 'primary' : 'secondary'})`
            }
            strokeWidth={hasWinner ? 3 : 2}
            strokeLinecap="round"
            style={{
              strokeDasharray: hasWinner ? 'none' : '1000',
              strokeDashoffset: hasWinner ? '0' : '1000',
              animation: hasWinner ? 'none' : `drawLine 1s ease-out ${index * 0.1}s forwards`
            }}
          />
          {/* Animated dot traveling along completed paths */}
          {hasWinner && (
            <circle r="3" fill={strokeColor}>
              <animateMotion dur="3s" repeatCount="indefinite" path={d} />
            </circle>
          )}
        </g>
      ))}
      <style>
        {`
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </svg>
  );
}
