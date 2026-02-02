import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTeams, useMatches, useCategories, useDivisions } from "@/hooks/useTournamentData";
import { useGroupsWithTeams } from "@/hooks/useGroupData";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  createTeam,
  deleteTeam,
  updateMatchResult,
  Team,
} from "@/lib/supabase-queries";
import {
  generateGroupStage,
  setGroupWinner,
  advanceToNextStage,
  GroupWithTeams,
} from "@/lib/group-queries";
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
  Crown,
  ArrowRight,
  Layers,
  ShieldAlert,
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
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"teams" | "groups">("teams");
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use admin role hook for proper server-side authorization check
  const { user, isAdmin, loading, error: adminError } = useAdminRole();

  // Add Team Modal State
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCategory, setNewTeamCategory] = useState("");
  const [newTeamDivision, setNewTeamDivision] = useState("");
  const [newRobotName, setNewRobotName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);

  // Generate Groups Modal State
  const [generateGroupsOpen, setGenerateGroupsOpen] = useState(false);
  const [groupCategory, setGroupCategory] = useState("");
  const [groupDivision, setGroupDivision] = useState("");
  const [generatingGroups, setGeneratingGroups] = useState(false);

  // Selected category/division for group management
  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [selectedDivision, setSelectedDivision] = useState<string>("2");

  const { data: teams = [] } = useTeams();
  const { data: matches = [] } = useMatches();
  const { data: categories = [] } = useCategories();
  const { data: divisions = [] } = useDivisions();
  const { data: groups = [], refetch: refetchGroups } = useGroupsWithTeams(
    Number(selectedCategory),
    Number(selectedDivision)
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin");
    }
  }, [loading, user, navigate]);

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

  const handleGenerateGroups = async () => {
    if (!groupCategory || !groupDivision) {
      toast({
        title: "Missing fields",
        description: "Please select category and division.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingGroups(true);
    try {
      await generateGroupStage(Number(groupCategory), Number(groupDivision));

      toast({
        title: "Groups generated!",
        description: "Teams have been divided into groups.",
      });

      setGenerateGroupsOpen(false);
      setGroupCategory("");
      setGroupDivision("");
      queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (error: any) {
      toast({
        title: "Error generating groups",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingGroups(false);
    }
  };

  const handleSetGroupWinner = async (groupId: string, winnerId: string) => {
    try {
      await setGroupWinner(groupId, winnerId);
      toast({
        title: "Winner selected!",
        description: "Group winner has been set.",
      });
      queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (error: any) {
      toast({
        title: "Error setting winner",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAdvanceStage = async () => {
    try {
      const result = await advanceToNextStage(Number(selectedCategory), Number(selectedDivision));
      toast({
        title: result.advanced ? "Stage advanced!" : "Cannot advance",
        description: result.message,
        variant: result.advanced ? "default" : "destructive",
      });
      if (result.advanced) {
        queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      }
    } catch (error: any) {
      toast({
        title: "Error advancing stage",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetMatchWinner = async (matchId: string, winnerId: string) => {
    try {
      await updateMatchResult(matchId, winnerId);
      toast({
        title: "Result recorded",
        description: "The match result has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
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
  const incompleteGroups = groups.filter((g) => !g.is_completed);

  // Get unique stages
  const stages = [...new Set(groups.map(g => g.stage_number))].sort((a, b) => a - b);
  const currentStage = stages.length > 0 ? Math.max(...stages) : 0;

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
                <Layers className="w-8 h-8 text-secondary" />
                <div>
                  <div className="text-2xl font-bold">{groups.length}</div>
                  <div className="text-sm text-muted-foreground">Groups</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-warning" />
                <div>
                  <div className="text-2xl font-bold">{incompleteGroups.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <div className="text-2xl font-bold">
                    {groups.filter((g) => g.is_completed).length}
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
              variant={activeTab === "groups" ? "default" : "outline"}
              onClick={() => setActiveTab("groups")}
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              Manage Groups
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
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                          Status
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
                            <span className="text-success">{team.wins}</span>
                            <span className="text-muted-foreground"> - </span>
                            <span className="text-destructive">{team.losses}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {team.is_eliminated ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-destructive/20 text-destructive">
                                Eliminated
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">
                                Active
                              </span>
                            )}
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

          {/* Groups Tab */}
          {activeTab === "groups" && (
            <div className="space-y-6">
              {/* Filters & Actions */}
              <div className="glass-card p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40 bg-muted/50">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger className="w-40 bg-muted/50">
                        <SelectValue placeholder="Division" />
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

                  <div className="flex flex-wrap gap-2 ml-auto">
                    <Dialog open={generateGroupsOpen} onOpenChange={setGenerateGroupsOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          <Zap className="w-4 h-4" />
                          Generate Groups
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-border/50">
                        <DialogHeader>
                          <DialogTitle>Generate Tournament Groups</DialogTitle>
                          <DialogDescription>
                            This will divide teams into groups of 5 (or smaller if needed).
                            Existing groups will be deleted.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={groupCategory} onValueChange={setGroupCategory}>
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
                            <Select value={groupDivision} onValueChange={setGroupDivision}>
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
                          <Button variant="outline" onClick={() => setGenerateGroupsOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleGenerateGroups} disabled={generatingGroups}>
                            {generatingGroups ? "Generating..." : "Generate"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {groups.length > 0 && incompleteGroups.length === 0 && (
                      <Button onClick={handleAdvanceStage} className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Advance to Next Stage
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["groupsWithTeams"] });
                        queryClient.invalidateQueries({ queryKey: ["matches"] });
                      }}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stage Info */}
              {currentStage > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Stage:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/20 text-primary">
                    Stage {currentStage}
                  </span>
                  {incompleteGroups.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      • {incompleteGroups.length} group(s) need winners
                    </span>
                  )}
                </div>
              )}

              {/* Groups Grid */}
              {groups.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  No groups created yet. Click "Generate Groups" to start the tournament.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <GroupManageCard
                      key={group.id}
                      group={group}
                      onSetWinner={handleSetGroupWinner}
                      onSetMatchWinner={handleSetMatchWinner}
                      matches={matches.filter(m => m.group_id === group.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface GroupManageCardProps {
  group: GroupWithTeams;
  onSetWinner: (groupId: string, winnerId: string) => void;
  onSetMatchWinner: (matchId: string, winnerId: string) => void;
  matches: any[];
}

function GroupManageCard({ group, onSetWinner, onSetMatchWinner, matches }: GroupManageCardProps) {
  const pendingMatches = matches.filter(m => m.status === "pending");

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border/30",
        group.is_completed ? "bg-success/10" : "bg-primary/10"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {group.group_number}
            </div>
            <h3 className="font-display font-semibold">{group.group_name}</h3>
          </div>
          {group.is_completed && (
            <CheckCircle className="w-5 h-5 text-success" />
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-4 space-y-2">
        {group.group_teams.map((gt) => (
          <div
            key={gt.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg",
              gt.is_winner
                ? "bg-success/10 border border-success/30"
                : "bg-muted/30"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {gt.team?.name?.charAt(0) || "?"}
            </div>
            <span className="font-medium flex-1 truncate text-sm">
              {gt.team?.name || "Unknown"}
            </span>
            {gt.is_winner && <Crown className="w-4 h-4 text-warning shrink-0" />}
            {!group.is_completed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSetWinner(group.id, gt.team_id)}
                className="text-xs shrink-0"
              >
                <Crown className="w-3 h-3 mr-1" />
                Win
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div className="p-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground uppercase mb-2">Pending Matches</p>
          {pendingMatches.map((match) => (
            <div key={match.id} className="p-2 rounded-lg bg-muted/30 mb-2">
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="flex-1 truncate">{match.team1?.name}</span>
                <Swords className="w-3 h-3 text-muted-foreground" />
                <span className="flex-1 truncate text-right">{match.team2?.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetMatchWinner(match.id, match.team1_id)}
                  className="flex-1 text-xs"
                >
                  {match.team1?.name?.split(" ")[0]} Wins
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetMatchWinner(match.id, match.team2_id)}
                  className="flex-1 text-xs"
                >
                  {match.team2?.name?.split(" ")[0]} Wins
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Winner Display */}
      {group.is_completed && group.winner && (
        <div className="p-4 bg-gradient-to-r from-warning/10 to-transparent border-t border-warning/30">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-warning/80">Group Winner</p>
              <p className="font-display font-bold text-warning">{group.winner.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
