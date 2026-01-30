import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTeams, useMatches, useCategories, useDivisions } from "@/hooks/useTournamentData";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  generateBracket,
  updateMatchResult,
  Team,
} from "@/lib/supabase-queries";
import {
  Shield,
  Users,
  Trophy,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Zap,
  CheckCircle,
  Bot,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"teams" | "matches">("teams");
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add Team Modal State
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCategory, setNewTeamCategory] = useState("");
  const [newTeamDivision, setNewTeamDivision] = useState("");
  const [newRobotName, setNewRobotName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);

  // Generate Bracket Modal State
  const [generateBracketOpen, setGenerateBracketOpen] = useState(false);
  const [bracketCategory, setBracketCategory] = useState("");
  const [bracketDivision, setBracketDivision] = useState("");
  const [generatingBracket, setGeneratingBracket] = useState(false);

  const { data: teams = [], refetch: refetchTeams } = useTeams();
  const { data: matches = [], refetch: refetchMatches } = useMatches();
  const { data: categories = [] } = useCategories();
  const { data: divisions = [] } = useDivisions();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/admin");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const handleAddTeam = async () => {
    if (!newTeamName || !newTeamCategory || !newTeamDivision) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setAddingTeam(true);
    try {
      await createTeam({
        name: newTeamName,
        category_id: Number(newTeamCategory),
        division_id: Number(newTeamDivision),
        robot_name: newRobotName || undefined,
      });

      toast({
        title: "Team added!",
        description: `${newTeamName} has been added to the tournament.`,
      });

      setAddTeamOpen(false);
      setNewTeamName("");
      setNewTeamCategory("");
      setNewTeamDivision("");
      setNewRobotName("");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (error: any) {
      toast({
        title: "Error adding team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingTeam(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!confirm(`Delete ${team.name}? This cannot be undone.`)) return;

    try {
      await deleteTeam(team.id);
      toast({
        title: "Team deleted",
        description: `${team.name} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (error: any) {
      toast({
        title: "Error deleting team",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateBracket = async () => {
    if (!bracketCategory || !bracketDivision) {
      toast({
        title: "Missing fields",
        description: "Please select category and division.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingBracket(true);
    try {
      await generateBracket(Number(bracketCategory), Number(bracketDivision));

      toast({
        title: "Bracket generated!",
        description: "The tournament bracket has been created.",
      });

      setGenerateBracketOpen(false);
      setBracketCategory("");
      setBracketDivision("");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    } catch (error: any) {
      toast({
        title: "Error generating bracket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingBracket(false);
    }
  };

  const handleSetWinner = async (matchId: string, winnerId: string) => {
    try {
      await updateMatchResult(matchId, winnerId);
      toast({
        title: "Result recorded",
        description: "The match result has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (error: any) {
      toast({
        title: "Error saving result",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Bot className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const pendingMatches = matches.filter((m) => m.status === "pending");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  Logged in as {user?.email}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={handleLogout} className="gap-2 w-fit">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{teams.length}</div>
                  <div className="text-sm text-muted-foreground">Teams</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Swords className="w-8 h-8 text-secondary" />
                <div>
                  <div className="text-2xl font-bold">{matches.length}</div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{pendingMatches.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">
                    {matches.filter((m) => m.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "teams" ? "default" : "outline"}
              onClick={() => setActiveTab("teams")}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Teams
            </Button>
            <Button
              variant={activeTab === "matches" ? "default" : "outline"}
              onClick={() => setActiveTab("matches")}
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              Manage Matches
            </Button>
          </div>

          {/* Teams Tab */}
          {activeTab === "teams" && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4" />
                      Add Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-border/50">
                    <DialogHeader>
                      <DialogTitle>Add New Team</DialogTitle>
                      <DialogDescription>
                        Add a new team to the tournament.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Team Name *</Label>
                        <Input
                          placeholder="Team Phoenix"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          className="bg-muted/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={newTeamCategory} onValueChange={setNewTeamCategory}>
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Division *</Label>
                        <Select value={newTeamDivision} onValueChange={setNewTeamDivision}>
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                          <SelectContent>
                            {divisions.map((div) => (
                              <SelectItem key={div.id} value={String(div.id)}>
                                {div.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Robot Name (optional)</Label>
                        <Input
                          placeholder="FireBolt"
                          value={newRobotName}
                          onChange={(e) => setNewRobotName(e.target.value)}
                          className="bg-muted/50"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddTeamOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTeam} disabled={addingTeam}>
                        {addingTeam ? "Adding..." : "Add Team"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["teams"] })}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {/* Teams Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                          Team
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                          Division
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                          W-L
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">
                                {team.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{team.name}</div>
                                {team.robot_name && (
                                  <div className="text-xs text-muted-foreground">
                                    {team.robot_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{team.category?.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{team.division?.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-green-400">{team.wins}</span>
                            <span className="text-muted-foreground"> - </span>
                            <span className="text-red-400">{team.losses}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTeam(team)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {teams.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No teams added yet. Click "Add Team" to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === "matches" && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Dialog open={generateBracketOpen} onOpenChange={setGenerateBracketOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Zap className="w-4 h-4" />
                      Generate Bracket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-border/50">
                    <DialogHeader>
                      <DialogTitle>Generate Tournament Bracket</DialogTitle>
                      <DialogDescription>
                        This will create Round 1 matches for the selected category and division.
                        Existing matches will be deleted.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={bracketCategory} onValueChange={setBracketCategory}>
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Division</Label>
                        <Select value={bracketDivision} onValueChange={setBracketDivision}>
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                          <SelectContent>
                            {divisions.map((div) => (
                              <SelectItem key={div.id} value={String(div.id)}>
                                {div.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGenerateBracketOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateBracket} disabled={generatingBracket}>
                        {generatingBracket ? "Generating..." : "Generate"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {/* Pending Matches */}
              <div>
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Pending Matches ({pendingMatches.length})
                </h3>

                {pendingMatches.length === 0 ? (
                  <div className="glass-card p-8 text-center text-muted-foreground">
                    No pending matches. Generate a bracket to create matches.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingMatches.map((match) => (
                      <div key={match.id} className="glass-card p-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          {match.round_name} • {match.category?.name} • {match.division?.name}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                              {match.team1?.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium flex-1 truncate">
                              {match.team1?.name || "TBD"}
                            </span>
                            {match.team1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetWinner(match.id, match.team1!.id)}
                                className="text-xs"
                              >
                                Win
                              </Button>
                            )}
                          </div>

                          <div className="text-center text-xs text-muted-foreground">VS</div>

                          <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                            <div className="w-8 h-8 rounded bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary">
                              {match.team2?.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium flex-1 truncate">
                              {match.team2?.name || "TBD"}
                            </span>
                            {match.team2 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetWinner(match.id, match.team2!.id)}
                                className="text-xs"
                              >
                                Win
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
