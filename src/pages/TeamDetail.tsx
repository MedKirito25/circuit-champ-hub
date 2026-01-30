import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MatchCard } from "@/components/MatchCard";
import { getTeamById, getTeamMatches, Team, Match } from "@/lib/supabase-queries";
import { Bot, ArrowLeft, Trophy, Skull, Users, Cpu, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: team, isLoading: teamLoading } = useQuery<Team | null>({
    queryKey: ["team", id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["teamMatches", id],
    queryFn: () => getTeamMatches(id!),
    enabled: !!id,
  });

  if (teamLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <Bot className="w-16 h-16 text-primary mx-auto animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading team details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Team Not Found</h2>
            <p className="text-muted-foreground mb-4">The team you're looking for doesn't exist.</p>
            <Link to="/teams">
              <Button variant="outline">Back to Teams</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSuiveur = team.category_id === 1;
  const isJunior = team.division_id === 1;
  const pendingMatches = matches.filter((m) => m.status === "pending");
  const completedMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Teams
          </Link>

          {/* Hero Section */}
          <div className="glass-card p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Team Avatar */}
              <div
                className={`
                  w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-bold shrink-0
                  ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
                  border border-current/20
                `}
              >
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  team.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Team Info */}
              <div className="flex-1">
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  {team.name}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`
                      px-3 py-1 rounded-lg text-sm font-semibold
                      ${isSuiveur ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
                    `}
                  >
                    {team.category?.name || "Unknown Category"}
                  </span>
                  <span
                    className={`
                      px-3 py-1 rounded-lg text-sm font-semibold border
                      ${isJunior ? "division-junior" : "division-adult"}
                    `}
                  >
                    {team.division?.name || "Unknown"} Division
                  </span>
                  {team.is_eliminated ? (
                    <span className="px-3 py-1 rounded-lg text-sm font-semibold status-eliminated border">
                      Eliminated
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg text-sm font-semibold status-pending border">
                      Active
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{team.wins}</span>
                    <span className="text-muted-foreground">Wins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-red-400" />
                    <span className="text-2xl font-bold text-red-400">{team.losses}</span>
                    <span className="text-muted-foreground">Losses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Robot Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Cpu className={`w-6 h-6 ${isSuiveur ? "text-primary" : "text-secondary"}`} />
                <h2 className="font-display text-xl font-bold">Robot Details</h2>
              </div>

              {/* Robot Photo */}
              <div className="relative h-48 md:h-64 bg-muted/30 rounded-xl overflow-hidden mb-4">
                {team.robot_photo_url ? (
                  <img
                    src={team.robot_photo_url}
                    alt={team.robot_name || team.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bot className={`w-16 h-16 ${isSuiveur ? "text-primary/50" : "text-secondary/50"}`} />
                  </div>
                )}
              </div>

              {/* Robot Name */}
              <h3 className="font-display font-bold text-lg mb-2">
                {team.robot_name || "Unnamed Robot"}
              </h3>

              {/* Robot Description */}
              {team.robot_description ? (
                <p className="text-muted-foreground">{team.robot_description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}
            </div>

            {/* Match History */}
            <div className="space-y-6">
              {/* Upcoming Matches */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h2 className="font-display text-xl font-bold">Upcoming Matches</h2>
                </div>

                {matchesLoading ? (
                  <p className="text-muted-foreground">Loading matches...</p>
                ) : pendingMatches.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingMatches.slice(0, 3).map((match) => (
                      <MatchCard key={match.id} match={match} showCategory />
                    ))}
                  </div>
                )}
              </div>

              {/* Past Matches */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                  <h2 className="font-display text-xl font-bold">Match History</h2>
                </div>

                {matchesLoading ? (
                  <p className="text-muted-foreground">Loading matches...</p>
                ) : completedMatches.length === 0 ? (
                  <p className="text-muted-foreground">No matches played yet.</p>
                ) : (
                  <div className="space-y-4">
                    {completedMatches.map((match) => (
                      <MatchCard key={match.id} match={match} showCategory />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
