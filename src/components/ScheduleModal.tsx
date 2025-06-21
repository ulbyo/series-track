
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

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

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: Series | null;
  selectedDate: Date;
  onSessionAdded: () => void;
}

export const ScheduleModal = ({ isOpen, onClose, series, selectedDate, onSessionAdded }: ScheduleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_date: selectedDate,
    scheduled_time: "",
    episode_number: 1,
    notes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!series) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("watch_sessions").insert({
        series_id: series.id,
        scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
        scheduled_time: formData.scheduled_time || null,
        episode_number: formData.episode_number,
        notes: formData.notes.trim() || null,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Watch session scheduled successfully",
      });

      setFormData({
        scheduled_date: selectedDate,
        scheduled_time: "",
        episode_number: 1,
        notes: "",
      });
      onSessionAdded();
      onClose();
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

  if (!isOpen || !series) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-medium text-black">Schedule Watch Session</h2>
          <Button
            onClick={onClose}
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
            {series.poster_url ? (
              <img 
                src={series.poster_url} 
                alt={series.title}
                className="w-12 h-16 object-cover rounded-md bg-gray-100"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-200 rounded-md" />
            )}
            <div>
              <h3 className="text-sm font-medium text-black">{series.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{series.genre}</p>
              {series.total_episodes && (
                <p className="text-xs text-gray-400 mt-1">{series.total_episodes} episodes total</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-black mb-2 uppercase tracking-wide">
                Date
              </label>
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, scheduled_date: date }))}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                  Episode
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.episode_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, episode_number: parseInt(e.target.value) || 1 }))}
                  className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                  Time
                </label>
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 h-9 text-xs border-gray-200 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-9 text-xs bg-black hover:bg-gray-800 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Schedule"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
