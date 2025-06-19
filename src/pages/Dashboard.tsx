
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, Plus, Search, Filter, Star, Calendar, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

type Series = Database["public"]["Tables"]["series"]["Row"];
type UserSeries = Database["public"]["Tables"]["user_series"]["Row"];
type SeriesStatus = Database["public"]["Enums"]["series_status"];

interface SeriesWithProgress extends Series {
  user_progress?: UserSeries;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [series, setSeries] = useState<SeriesWithProgress[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<SeriesWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<SeriesStatus | "all">("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchSeries();
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchTerm, selectedStatus]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchSeries = async () => {
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .order("title");

      if (seriesError) throw seriesError;

      const { data: userSeriesData, error: userSeriesError } = await supabase
        .from("user_series")
        .select("*");

      if (userSeriesError) throw userSeriesError;

      const seriesWithProgress = seriesData.map((series) => ({
        ...series,
        user_progress: userSeriesData.find((us) => us.series_id === series.id),
      }));

      setSeries(seriesWithProgress);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSeries = () => {
    let filtered = series;

    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.genre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((s) => s.user_progress?.status === selectedStatus);
    }

    setFilteredSeries(filtered);
  };

  const addToList = async (seriesId: string, status: SeriesStatus = "plan_to_watch") => {
    try {
      const { error } = await supabase.from("user_series").insert({
        series_id: seriesId,
        status,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Series added to your list",
      });
      fetchSeries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (userSeriesId: string, episode: number, totalEpisodes: number) => {
    try {
      const status = episode >= totalEpisodes ? "completed" : "watching";
      const updates: any = {
        current_episode: episode,
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("user_series")
        .update(updates)
        .eq("id", userSeriesId);

      if (error) throw error;

      fetchSeries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusColor = (status: SeriesStatus) => {
    switch (status) {
      case "watching":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: SeriesStatus) => {
    switch (status) {
      case "plan_to_watch":
        return "Plan to Watch";
      case "on_hold":
        return "On Hold";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SeriesTracker
            </h1>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as SeriesStatus | "all")}
              className="h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="dropped">Dropped</option>
              <option value="plan_to_watch">Plan to Watch</option>
            </select>
          </div>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeries.map((series) => (
            <div
              key={series.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative">
                {series.poster_url && (
                  <img
                    src={series.poster_url}
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    {series.release_year}
                    {series.imdb_rating && (
                      <>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {series.imdb_rating}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {series.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {series.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>{series.genre}</span>
                  <span>{series.total_episodes} episodes</span>
                </div>

                {series.user_progress ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(series.user_progress.status)}>
                        {getStatusLabel(series.user_progress.status)}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {series.user_progress.current_episode || 0}/{series.total_episodes || 0}
                      </span>
                    </div>
                    
                    {series.total_episodes && (
                      <Progress
                        value={((series.user_progress.current_episode || 0) / series.total_episodes) * 100}
                        className="h-2"
                      />
                    )}

                    {series.user_progress.status === "watching" && (
                      <Button
                        onClick={() => {
                          const nextEpisode = (series.user_progress?.current_episode || 0) + 1;
                          updateProgress(series.user_progress!.id, nextEpisode, series.total_episodes || 0);
                        }}
                        size="sm"
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Episode {(series.user_progress.current_episode || 0) + 1}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => addToList(series.id)}
                    size="sm"
                    variant="outline"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to List
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No series found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
