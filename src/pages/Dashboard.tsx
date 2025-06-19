
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, Plus, Search, Filter, Star, Calendar, Play, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddSeriesModal } from "@/components/AddSeriesModal";
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
  const [showAddModal, setShowAddModal] = useState(false);
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
        title: "Added to List",
        description: "Series added successfully",
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
        return "bg-black text-white";
      case "completed":
        return "bg-gray-800 text-white";
      case "on_hold":
        return "bg-gray-500 text-white";
      case "dropped":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-200 text-black";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-lg font-medium text-black">Series</h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="h-8 px-4 text-sm bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Series
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="h-8 px-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm border-gray-200 bg-gray-50 rounded-lg focus:bg-white transition-colors duration-200"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as SeriesStatus | "all")}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-black focus:bg-white transition-colors duration-200"
            >
              <option value="all">All</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="dropped">Dropped</option>
              <option value="plan_to_watch">Plan to Watch</option>
            </select>
          </div>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSeries.map((series) => (
            <div
              key={series.id}
              className="bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-300 overflow-hidden group"
            >
              <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                {series.poster_url ? (
                  <img
                    src={series.poster_url}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-white text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  {series.release_year && (
                    <span>{series.release_year}</span>
                  )}
                  {series.imdb_rating && (
                    <>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{series.imdb_rating}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-sm text-black mb-1 line-clamp-1">
                  {series.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                  {series.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{series.genre}</span>
                  <span>{series.total_episodes} episodes</span>
                </div>

                {series.user_progress ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(series.user_progress.status)} text-xs px-2 py-0.5 rounded-full`}>
                        {getStatusLabel(series.user_progress.status)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {series.user_progress.current_episode || 0}/{series.total_episodes || 0}
                      </span>
                    </div>
                    
                    {series.total_episodes && (
                      <Progress
                        value={((series.user_progress.current_episode || 0) / series.total_episodes) * 100}
                        className="h-1.5 bg-gray-100"
                      />
                    )}

                    {series.user_progress.status === "watching" && (
                      <Button
                        onClick={() => {
                          const nextEpisode = (series.user_progress?.current_episode || 0) + 1;
                          updateProgress(series.user_progress!.id, nextEpisode, series.total_episodes || 0);
                        }}
                        className="w-full h-8 text-xs bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200"
                      >
                        <Play className="w-3 h-3 mr-1.5" />
                        Episode {(series.user_progress.current_episode || 0) + 1}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => addToList(series.id)}
                    variant="outline"
                    className="w-full h-8 text-xs border-gray-200 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    Add to List
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-3">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-sm font-medium text-black mb-1">
              No series found
            </h3>
            <p className="text-xs text-gray-600">
              Try adjusting your search or add a new series
            </p>
          </div>
        )}
      </div>

      <AddSeriesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSeriesAdded={fetchSeries}
      />
    </div>
  );
};

export default Dashboard;
