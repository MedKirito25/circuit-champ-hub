import { Match } from "@/lib/supabase-queries";
import { Swords, Trophy, Clock, CheckCircle } from "lucide-react";

interface MatchCardProps {
  match: Match;
  showCategory?: boolean;
}

export function MatchCard({ match, showCategory = false }: MatchCardProps) {
  const isCompleted = match.status === "completed";
  const isPending = match.status === "pending";
  const isSuiveur = match.category_id === 1;

  return (
    <div
      className={`
        glass-card p-4 transition-all
        ${isCompleted ? "opacity-80" : "hover-glow"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`
              px-2 py-1 rounded text-xs font-semibold
              ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
            `}
          >
            {match.round_name || `Round ${match.round_number}`}
          </span>
          {showCategory && match.category && (
            <span className="text-xs text-muted-foreground">
              {match.category.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-completed border">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-pending border">
              <Clock className="w-3 h-3" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {/* Team 1 */}
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg transition-colors
            ${match.winner_id === match.team1_id ? "bg-green-500/10 border border-green-500/30" : "bg-muted/30"}
          `}
        >
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
              ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
            `}
          >
            {match.team1?.logo_url ? (
              <img
                src={match.team1.logo_url}
                alt={match.team1.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              match.team1?.name?.charAt(0) || "?"
            )}
          </div>
          <span className="font-medium flex-1 truncate">
            {match.team1?.name || "TBD"}
          </span>
          {match.winner_id === match.team1_id && (
            <Trophy className="w-5 h-5 text-green-400 shrink-0" />
          )}
        </div>

        {/* VS Divider */}
        <div className="flex items-center gap-3 px-3">
          <div className="flex-1 h-px bg-border/50" />
          <Swords className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Team 2 */}
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg transition-colors
            ${match.winner_id === match.team2_id ? "bg-green-500/10 border border-green-500/30" : "bg-muted/30"}
          `}
        >
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
              ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
            `}
          >
            {match.team2?.logo_url ? (
              <img
                src={match.team2.logo_url}
                alt={match.team2.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              match.team2?.name?.charAt(0) || "?"
            )}
          </div>
          <span className="font-medium flex-1 truncate">
            {match.team2?.name || "TBD"}
          </span>
          {match.winner_id === match.team2_id && (
            <Trophy className="w-5 h-5 text-green-400 shrink-0" />
          )}
        </div>
      </div>

      {/* Match Info */}
      {match.match_date && (
        <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
          {new Date(match.match_date).toLocaleString()}
        </div>
      )}
    </div>
  );
}
