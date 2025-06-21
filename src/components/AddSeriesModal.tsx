
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface AddSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeriesAdded: () => void;
}

export const AddSeriesModal = ({ isOpen, onClose, onSeriesAdded }: AddSeriesModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    total_episodes: "",
    genre: "",
    release_year: "",
    poster_url: "",
    imdb_rating: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("series").insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        total_episodes: formData.total_episodes ? parseInt(formData.total_episodes) : null,
        genre: formData.genre.trim() || null,
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
        poster_url: formData.poster_url.trim() || null,
        imdb_rating: formData.imdb_rating ? parseFloat(formData.imdb_rating) : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Series added successfully",
      });

      setFormData({
        title: "",
        description: "",
        total_episodes: "",
        genre: "",
        release_year: "",
        poster_url: "",
        imdb_rating: "",
      });
      onSeriesAdded();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-medium text-black">Add New Series</h2>
          <Button
            onClick={onClose}
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter series title"
              className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the series"
              rows={2}
              className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Episodes
              </label>
              <Input
                type="number"
                value={formData.total_episodes}
                onChange={(e) => handleInputChange("total_episodes", e.target.value)}
                placeholder="Total episodes"
                className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Year
              </label>
              <Input
                type="number"
                value={formData.release_year}
                onChange={(e) => handleInputChange("release_year", e.target.value)}
                placeholder="Release year"
                className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
                min="1900"
                max="2030"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              Genre
            </label>
            <Input
              value={formData.genre}
              onChange={(e) => handleInputChange("genre", e.target.value)}
              placeholder="e.g., Drama, Comedy, Action"
              className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              Poster URL
            </label>
            <Input
              type="url"
              value={formData.poster_url}
              onChange={(e) => handleInputChange("poster_url", e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              IMDb Rating
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.imdb_rating}
              onChange={(e) => handleInputChange("imdb_rating", e.target.value)}
              placeholder="e.g., 8.5"
              className="h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded-lg"
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
              disabled={loading || !formData.title.trim()}
              className="flex-1 h-9 text-xs bg-black hover:bg-gray-800 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Series"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
