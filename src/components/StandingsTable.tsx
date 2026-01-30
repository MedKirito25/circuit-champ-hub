import { Team } from "@/lib/supabase-queries";
import { Trophy, Skull, ChevronUp, ChevronDown, Minus } from "lucide-react";

interface StandingsTableProps {
  teams: Team[];
  title: string;
  categoryId: number;
}

export function StandingsTable({ teams, title, categoryId }: StandingsTableProps) {
  const isSuiveur = categoryId === 1;

  if (teams.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg mb-4">{title}</h3>
        <p className="text-muted-foreground text-sm">No teams registered yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border/50">
        <h3 className="font-display font-bold text-lg">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                W
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                L
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {teams.map((team, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const isEliminated = team.is_eliminated;

              return (
                <tr
                  key={team.id}
                  className={`
                    transition-colors hover:bg-muted/20
                    ${isEliminated ? "opacity-60" : ""}
                  `}
                >
                  {/* Rank */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isTop3 ? (
                        <div
                          className={`
                            w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                            ${rank === 1 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : ""}
                            ${rank === 2 ? "bg-gray-400/20 text-gray-300 border border-gray-400/30" : ""}
                            ${rank === 3 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : ""}
                          `}
                        >
                          {rank}
                        </div>
                      ) : (
                        <span className="w-8 h-8 flex items-center justify-center text-muted-foreground font-medium">
                          {rank}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                          ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
                        `}
                      >
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          team.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{team.name}</p>
                        {team.robot_name && (
                          <p className="text-xs text-muted-foreground">{team.robot_name}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Wins */}
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1 text-green-400 font-semibold">
                      <ChevronUp className="w-4 h-4" />
                      {team.wins}
                    </div>
                  </td>

                  {/* Losses */}
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1 text-red-400 font-semibold">
                      <ChevronDown className="w-4 h-4" />
                      {team.losses}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    {isEliminated ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-eliminated border">
                        <Skull className="w-3 h-3" />
                        Eliminated
                      </span>
                    ) : team.is_qualified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-completed border">
                        <Trophy className="w-3 h-3" />
                        Qualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium status-pending border">
                        <Minus className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
