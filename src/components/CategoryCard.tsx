import { useNavigate } from "react-router-dom";
import { Bot, Car, Users, ArrowRight, Trophy } from "lucide-react";
import { Category, Division } from "@/lib/supabase-queries";

interface CategoryCardProps {
  category: Category;
  division: Division;
  teamCount: number;
  matchCount?: number;
}

export function CategoryCard({ category, division, teamCount, matchCount = 0 }: CategoryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/brackets?category=${category.id}&division=${division.id}`);
  };

  const isSuiveur = category.id === 1;
  const isJunior = division.id === 1;

  return (
    <div
      onClick={handleClick}
      className={`
        glass-card p-6 cursor-pointer group relative overflow-hidden
        hover-glow transition-all duration-300
        ${isSuiveur ? "hover:border-primary/50" : "hover:border-secondary/50"}
      `}
    >
      {/* Background glow */}
      <div
        className={`
          absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 
          transition-opacity group-hover:opacity-40
          ${isSuiveur ? "bg-primary" : "bg-secondary"}
        `}
      />

      {/* Icon */}
      <div
        className={`
          w-14 h-14 rounded-xl flex items-center justify-center mb-4
          ${isSuiveur ? "bg-primary/20 border-primary/30" : "bg-secondary/20 border-secondary/30"}
          border transition-all group-hover:scale-110
        `}
      >
        {isSuiveur ? (
          <Bot className={`w-7 h-7 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
        ) : (
          <Car className={`w-7 h-7 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
        )}
      </div>

      {/* Content */}
      <h3 className="font-display font-bold text-xl text-foreground mb-2">
        {category.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {category.description}
      </p>

      {/* Division Badge */}
      <div
        className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4
          ${isJunior ? "division-junior" : "division-adult"}
          border
        `}
      >
        <Users className="w-3 h-3" />
        {division.name} Division
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{teamCount} Teams</span>
        </div>
        {matchCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{matchCount} Matches</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        className={`
          flex items-center gap-2 text-sm font-medium
          ${isSuiveur ? "text-primary" : "text-secondary"}
          transition-all group-hover:gap-3
        `}
      >
        View Bracket
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}
