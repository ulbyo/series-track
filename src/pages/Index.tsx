
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tv, BarChart3, Star, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-8">
              <Tv className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Track Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Favorite Series
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Never lose track of where you left off. Organize your watchlist, track your progress, and discover new series to binge.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/auth")}
                size="lg"
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-lg"
              >
                Get Started Free
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                size="lg" 
                variant="outline"
                className="h-14 px-8 rounded-2xl border-gray-300 dark:border-gray-600 font-medium text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to track series
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Simple, beautiful, and powerful series tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Track Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep track of which episode you're on for every series you're watching
            </p>
          </div>

          <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl mb-6">
              <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Rate & Review
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Rate your favorite series and keep personal notes about what you watched
            </p>
          </div>

          <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl mb-6">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Organize Lists
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create custom lists for different statuses: watching, completed, on hold, and more
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to organize your watchlist?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of users who never lose track of their favorite series
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            size="lg"
            className="h-14 px-8 rounded-2xl bg-white text-blue-600 hover:bg-gray-100 font-medium text-lg"
          >
            Start Tracking Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
