import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RobotCard } from "@/components/RobotCard";
import { useCategories, useDivisions, useTeams, useRealtimeTeams } from "@/hooks/useTournamentData";
import { Bot, Cpu, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Robots() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  const { data: categories = [] } = useCategories();
  const { data: divisions = [] } = useDivisions();
  const { data: teams = [], isLoading } = useTeams();

  // Enable realtime updates
  useRealtimeTeams();

  // Filter teams (robots are tied to teams)
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.robot_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.robot_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || team.category_id === Number(selectedCategory);
    const matchesDivision =
      selectedDivision === "all" || team.division_id === Number(selectedDivision);

    return matchesSearch && matchesCategory && matchesDivision;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Cpu className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  Robots Gallery
                </h1>
                <p className="text-muted-foreground">
                  Meet the incredible machines competing in the tournament
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search robots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter:</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-muted/50 border-border/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger className="w-48 bg-muted/50 border-border/50">
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={String(division.id)}>
                        {division.name} Division
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Robots Grid */}
          {isLoading ? (
            <div className="glass-card p-12 text-center">
              <Bot className="w-16 h-16 text-secondary mx-auto animate-pulse mb-4" />
              <p className="text-lg text-muted-foreground">Loading robots...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Cpu className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl mb-2">No Robots Found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No robots match your search criteria."
                  : "No robots have been registered yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeams.map((team) => (
                <RobotCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
