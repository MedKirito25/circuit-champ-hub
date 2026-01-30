import { Match } from "@/lib/supabase-queries";
import { MatchCard } from "./MatchCard";
import { Trophy, Zap } from "lucide-react";

interface BracketViewProps {
  matches: Match[];
  categoryId: number;
}

export function BracketView({ matches, categoryId }: BracketViewProps) {
  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const round = match.round_number;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  const isSuiveur = categoryId === 1;

  if (matches.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div
          className={`
            w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4
            ${isSuiveur ? "bg-primary/20" : "bg-secondary/20"}
          `}
        >
          <Trophy className={`w-8 h-8 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">No Matches Yet</h3>
        <p className="text-muted-foreground">
          The bracket hasn't been generated yet. Check back soon!
        </p>
      </div>
    );
  }

  const getRoundName = (roundNum: number, totalRounds: number) => {
    const remaining = totalRounds - roundNum + 1;
    if (remaining === 1) return "Finals";
    if (remaining === 2) return "Semifinals";
    if (remaining === 3) return "Quarterfinals";
    return `Round ${roundNum}`;
  };

  return (
    <div className="space-y-8">
      {/* Bracket Header */}
      <div className="flex items-center gap-3">
        <Zap className={`w-6 h-6 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
        <h2 className="font-display font-bold text-2xl">Tournament Bracket</h2>
        <span
          className={`
            ml-auto px-3 py-1 rounded-full text-sm font-medium
            ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
          `}
        >
          {matches.length} Matches
        </span>
      </div>

      {/* Rounds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {roundNumbers.map((roundNum) => {
          const roundMatches = rounds[roundNum];
          const roundName = getRoundName(roundNum, roundNumbers.length);

          return (
            <div key={roundNum} className="space-y-4">
              {/* Round Header */}
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
                  `}
                >
                  {roundNum}
                </div>
                <h3 className="font-display font-semibold text-lg">{roundName}</h3>
                <span className="text-sm text-muted-foreground ml-auto">
                  {roundMatches.length} match{roundMatches.length !== 1 ? "es" : ""}
                </span>
              </div>

              {/* Matches */}
              <div className="space-y-4">
                {roundMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
