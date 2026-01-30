import { Link } from "react-router-dom";
import { Team } from "@/lib/supabase-queries";
import { Trophy, Skull, Bot, ArrowRight } from "lucide-react";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const isSuiveur = team.category_id === 1;
  const isJunior = team.division_id === 1;

  return (
    <Link
      to={`/team/${team.id}`}
      className="glass-card p-5 group hover-glow transition-all duration-300 block"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`
            w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0
            ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
            border border-current/20 transition-all group-hover:scale-105
          `}
        >
          {team.logo_url ? (
            <img
              src={team.logo_url}
              alt={team.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            team.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Team Name */}
          <h3 className="font-display font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {team.name}
          </h3>

          {/* Category & Division */}
          <div className="flex items-center gap-2 mt-1 mb-3">
            <span
              className={`
                text-xs font-medium px-2 py-0.5 rounded
                ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
              `}
            >
              {team.category?.name || "Unknown"}
            </span>
            <span
              className={`
                text-xs font-medium px-2 py-0.5 rounded border
                ${isJunior ? "division-junior" : "division-adult"}
              `}
            >
              {team.division?.name || "Unknown"}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">{team.wins}</span>
              <span className="text-xs text-muted-foreground">wins</span>
            </div>
            <div className="flex items-center gap-1">
              <Skull className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">{team.losses}</span>
              <span className="text-xs text-muted-foreground">losses</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {team.is_eliminated ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-eliminated border">
              <Skull className="w-3 h-3" />
              Out
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-pending border">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Robot Info */}
      {team.robot_name && (
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Robot:</span>
          <span className="text-sm font-medium text-foreground">{team.robot_name}</span>
        </div>
      )}

      {/* View More */}
      <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all">
        View Details
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
