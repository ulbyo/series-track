
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Plus, LogOut, Search, Calendar as CalendarIcon, Clock, Play, Check, X } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import { AddSeriesModal } from "@/components/AddSeriesModal";
import { ScheduleModal } from "@/components/ScheduleModal";

interface Series {
  id: string;
  title: string;
  description: string | null;
  total_episodes: number | null;
  genre: string | null;
  release_year: number | null;
  poster_url: string | null;
  imdb_rating: number | null;
}

interface WatchSession {
  id: string;
  series_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  episode_number: number;
  status: 'scheduled' | 'completed' | 'skipped';
  notes: string | null;
  series: Series;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [series, setSeries] = useState<Series[]>([]);
  const [watchSessions, setWatchSessions] = useState<WatchSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'week'>('week');
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSeriesOpen, setIsAddSeriesOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [seriesResult, sessionsResult] = await Promise.all([
        supabase.from("series").select("*").order("title"),
        supabase
          .from("watch_sessions")
          .select(`
            *,
            series:series_id (*)
          `)
          .order("scheduled_date")
      ]);

      if (seriesResult.error) throw seriesResult.error;
      if (sessionsResult.error) throw sessionsResult.error;

      setSeries(seriesResult.data || []);
      setWatchSessions(sessionsResult.data || []);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const updateSessionStatus = async (sessionId: string, status: 'completed' | 'skipped') => {
    try {
      const { error } = await supabase
        .from("watch_sessions")
        .update({ status })
        .eq("id", sessionId);

      if (error) throw error;
      loadData();
      toast({
        title: "Success",
        description: `Session marked as ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getSessionsForDate = (date: Date) => {
    return watchSessions.filter(session => 
      isSameDay(new Date(session.scheduled_date), date)
    );
  };

  const filteredSeries = series.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 border border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-sm font-medium text-black">Series Scheduler</h1>
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === 'week' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === 'calendar' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Calendar
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  placeholder="Search series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-8 pl-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
                />
              </div>
              <Button
                onClick={() => setIsAddSeriesOpen(true)}
                className="h-8 px-3 text-xs bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Series
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Series List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-xs font-medium text-gray-900 mb-3 uppercase tracking-wide">Series</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSeries.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSeries(s);
                      setIsScheduleOpen(true);
                    }}
                    className="p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {s.poster_url ? (
                        <img 
                          src={s.poster_url} 
                          alt={s.title}
                          className="w-8 h-12 object-cover rounded-md bg-gray-100"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <Play className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-black truncate">{s.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.genre}</p>
                        {s.total_episodes && (
                          <p className="text-xs text-gray-400 mt-1">{s.total_episodes} episodes</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar/Schedule View */}
          <div className="lg:col-span-3">
            {viewMode === 'calendar' ? (
              <div className="bg-gray-50 rounded-xl p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-lg bg-white border border-gray-100"
                />
                
                {/* Sessions for selected date */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium text-gray-900 mb-3 uppercase tracking-wide">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </h3>
                  <div className="space-y-2">
                    {getSessionsForDate(selectedDate).map((session) => (
                      <div key={session.id} className="bg-white rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'skipped' ? 'bg-gray-400' : 'bg-blue-500'
                            }`} />
                            <div>
                              <p className="text-xs font-medium text-black">{session.series.title}</p>
                              <p className="text-xs text-gray-500">Episode {session.episode_number}</p>
                              {session.scheduled_time && (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {session.scheduled_time}
                                </p>
                              )}
                            </div>
                          </div>
                          {session.status === 'scheduled' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateSessionStatus(session.id, 'completed')}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-green-50 text-green-600 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => updateSessionStatus(session.id, 'skipped')}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                    Week of {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMMM d')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                  {getWeekDays().map((day) => (
                    <div key={day.toISOString()} className="min-h-32">
                      <div className="text-xs font-medium text-gray-900 mb-2 text-center">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-xs text-gray-500 mb-3 text-center">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {getSessionsForDate(day).map((session) => (
                          <div
                            key={session.id}
                            className={`p-2 rounded-md text-xs border cursor-pointer group transition-all ${
                              session.status === 'completed' 
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : session.status === 'skipped'
                                ? 'bg-gray-50 border-gray-200 text-gray-600'
                                : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                            }`}
                            onClick={() => setSelectedDate(day)}
                          >
                            <p className="font-medium truncate">{session.series.title}</p>
                            <p className="text-xs opacity-75">Ep {session.episode_number}</p>
                            {session.scheduled_time && (
                              <p className="text-xs opacity-60">{session.scheduled_time}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddSeriesModal
        isOpen={isAddSeriesOpen}
        onClose={() => setIsAddSeriesOpen(false)}
        onSeriesAdded={loadData}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setSelectedSeries(null);
        }}
        series={selectedSeries}
        selectedDate={selectedDate}
        onSessionAdded={loadData}
      />
    </div>
  );
};

export default Dashboard;
