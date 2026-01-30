import { Link } from "react-router-dom";
import { Team } from "@/lib/supabase-queries";
import { Bot, Cpu, Zap, ArrowRight } from "lucide-react";

interface RobotCardProps {
  team: Team;
}

export function RobotCard({ team }: RobotCardProps) {
  const isSuiveur = team.category_id === 1;

  return (
    <Link
      to={`/team/${team.id}`}
      className="glass-card overflow-hidden group hover-glow transition-all duration-300 block"
    >
      {/* Robot Image */}
      <div className="relative h-48 bg-muted/30 overflow-hidden">
        {team.robot_photo_url ? (
          <img
            src={team.robot_photo_url}
            alt={team.robot_name || team.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={`
                w-24 h-24 rounded-2xl flex items-center justify-center
                ${isSuiveur ? "bg-primary/20" : "bg-secondary/20"}
              `}
            >
              <Bot className={`w-12 h-12 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

        {/* Category badge */}
        <div
          className={`
            absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
            ${isSuiveur ? "bg-primary/80 text-primary-foreground" : "bg-secondary/80 text-secondary-foreground"}
          `}
        >
          {team.category?.name || "Unknown"}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Robot Name */}
        <div className="flex items-center gap-2 mb-2">
          <Cpu className={`w-5 h-5 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {team.robot_name || "Unnamed Robot"}
          </h3>
        </div>

        {/* Team */}
        <p className="text-sm text-muted-foreground mb-3">
          by <span className="font-medium text-foreground">{team.name}</span>
        </p>

        {/* Description */}
        {team.robot_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {team.robot_description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">{team.wins} Wins</span>
          </div>
          <div
            className={`
              text-xs font-medium px-2 py-0.5 rounded border
              ${team.division_id === 1 ? "division-junior" : "division-adult"}
            `}
          >
            {team.division?.name || "Unknown"}
          </div>
        </div>

        {/* View More */}
        <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all">
          View Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
