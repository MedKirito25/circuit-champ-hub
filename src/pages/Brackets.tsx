import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TournamentBracketView } from "@/components/TournamentBracketView";
import { useCategories, useDivisions, useRealtimeMatches } from "@/hooks/useTournamentData";
import { useRealtimeGroups } from "@/hooks/useGroupData";
import { Bot, Trophy, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Brackets() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialCategory = searchParams.get("category") ? Number(searchParams.get("category")) : 1;
  const initialDivision = searchParams.get("division") ? Number(searchParams.get("division")) : 2;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDivision, setSelectedDivision] = useState(initialDivision);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: divisions = [], isLoading: divisionsLoading } = useDivisions();

  // Enable realtime updates
  useRealtimeMatches();
  useRealtimeGroups();

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(Number(value));
    setSearchParams({ category: value, division: String(selectedDivision) });
  };

  const handleDivisionChange = (value: string) => {
    setSelectedDivision(Number(value));
    setSearchParams({ category: String(selectedCategory), division: value });
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentDivision = divisions.find((d) => d.id === selectedDivision);
  const isLoading = categoriesLoading || divisionsLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  Tournament Brackets
                </h1>
                <p className="text-muted-foreground">
                  Live group stages with real-time updates
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter:</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Select
                  value={String(selectedCategory)}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-48 bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(selectedDivision)}
                  onValueChange={handleDivisionChange}
                >
                  <SelectTrigger className="w-48 bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={String(division.id)}>
                        {division.name} Division
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Live updates enabled</span>
              </div>
            </div>
          </div>

          {/* Current Selection */}
          {currentCategory && currentDivision && (
            <div className="mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold
                    ${selectedCategory === 1 ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary/20 text-secondary border border-secondary/30"}
                  `}
                >
                  {currentCategory.name}
                </span>
                <span
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold border
                    ${selectedDivision === 1 ? "division-junior" : "division-adult"}
                  `}
                >
                  {currentDivision.name} Division
                </span>
              </div>
            </div>
          )}

          {/* Tournament Bracket View */}
          {isLoading ? (
            <div className="glass-card p-12 text-center">
              <Bot className="w-16 h-16 text-primary mx-auto animate-pulse mb-4" />
              <p className="text-lg text-muted-foreground">Loading bracket...</p>
            </div>
          ) : (
            <TournamentBracketView categoryId={selectedCategory} divisionId={selectedDivision} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
