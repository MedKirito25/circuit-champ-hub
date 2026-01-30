import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { StandingsTable } from "@/components/StandingsTable";
import { useCategories, useDivisions, useTeams, useMatches, useRealtimeTeams, useRealtimeMatches } from "@/hooks/useTournamentData";
import { Bot, Trophy, Users, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: categories = [] } = useCategories();
  const { data: divisions = [] } = useDivisions();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: matches = [] } = useMatches();

  // Enable realtime updates
  useRealtimeTeams();
  useRealtimeMatches();

  // Calculate team counts per category/division
  const getTeamCount = (categoryId: number, divisionId: number) =>
    teams.filter((t) => t.category_id === categoryId && t.division_id === divisionId).length;

  const getMatchCount = (categoryId: number, divisionId: number) =>
    matches.filter((m) => m.category_id === categoryId && m.division_id === divisionId).length;

  // Get standings per category/division
  const getStandings = (categoryId: number, divisionId: number) =>
    teams
      .filter((t) => t.category_id === categoryId && t.division_id === divisionId)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  // Stats
  const totalTeams = teams.length;
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const pendingMatches = matches.filter((m) => m.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-pulse-slow">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Live Tournament</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              ITBS <span className="gradient-text neon-text">Robotics</span>
              <br />
              Tournament 2026
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Welcome to IT Business School's premier robotics competition. Watch live brackets, track team standings, and experience the future of engineering excellence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/brackets">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Trophy className="w-5 h-5" />
                  View Live Brackets
                </Button>
              </Link>
              <Link to="/teams">
                <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10">
                  <Users className="w-5 h-5" />
                  Explore Teams
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="glass-card p-4">
                <div className="text-3xl font-display font-bold text-primary">{totalTeams}</div>
                <div className="text-sm text-muted-foreground">Teams</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-display font-bold text-secondary">{totalMatches}</div>
                <div className="text-sm text-muted-foreground">Matches</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-display font-bold text-green-400">{completedMatches}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-display font-bold text-yellow-400">{pendingMatches}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Tournament Categories
              </h2>
              <p className="text-muted-foreground">Choose a category to view the live bracket</p>
            </div>
            <Link to="/brackets" className="hidden md:flex items-center gap-2 text-primary hover:underline">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Robot Suiveur - Adult */}
            {categories.find((c) => c.id === 1) && divisions.find((d) => d.id === 2) && (
              <CategoryCard
                category={categories.find((c) => c.id === 1)!}
                division={divisions.find((d) => d.id === 2)!}
                teamCount={getTeamCount(1, 2)}
                matchCount={getMatchCount(1, 2)}
              />
            )}

            {/* Robot Tout Terrain - Junior */}
            {categories.find((c) => c.id === 2) && divisions.find((d) => d.id === 1) && (
              <CategoryCard
                category={categories.find((c) => c.id === 2)!}
                division={divisions.find((d) => d.id === 1)!}
                teamCount={getTeamCount(2, 1)}
                matchCount={getMatchCount(2, 1)}
              />
            )}

            {/* Robot Tout Terrain - Adult */}
            {categories.find((c) => c.id === 2) && divisions.find((d) => d.id === 2) && (
              <CategoryCard
                category={categories.find((c) => c.id === 2)!}
                division={divisions.find((d) => d.id === 2)!}
                teamCount={getTeamCount(2, 2)}
                matchCount={getMatchCount(2, 2)}
              />
            )}
          </div>
        </div>
      </section>

      {/* Standings Section */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Live Standings
            </h2>
          </div>

          {teamsLoading ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-primary mx-auto animate-pulse mb-4" />
              <p className="text-muted-foreground">Loading standings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StandingsTable
                teams={getStandings(1, 2)}
                title="Robot Suiveur - Adult"
                categoryId={1}
              />
              <StandingsTable
                teams={getStandings(2, 1)}
                title="Robot Tout Terrain - Junior"
                categoryId={2}
              />
              <StandingsTable
                teams={getStandings(2, 2)}
                title="Robot Tout Terrain - Adult"
                categoryId={2}
              />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
