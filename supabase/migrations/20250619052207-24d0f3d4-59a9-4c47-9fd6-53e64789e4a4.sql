
-- Create enum for series status
CREATE TYPE public.series_status AS ENUM ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch');

-- Create series table to store TV shows/series information
CREATE TABLE public.series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  total_episodes INTEGER,
  genre TEXT,
  release_year INTEGER,
  poster_url TEXT,
  imdb_rating DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_series table to track user's progress
CREATE TABLE public.user_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  series_id UUID REFERENCES public.series NOT NULL,
  status public.series_status NOT NULL DEFAULT 'plan_to_watch',
  current_episode INTEGER DEFAULT 0,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 10),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- Enable Row Level Security
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_series ENABLE ROW LEVEL SECURITY;

-- RLS policies for series (public read access)
CREATE POLICY "Anyone can view series" 
  ON public.series 
  FOR SELECT 
  USING (true);

-- RLS policies for user_series (users can only see their own progress)
CREATE POLICY "Users can view their own series progress" 
  ON public.user_series 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own series progress" 
  ON public.user_series 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series progress" 
  ON public.user_series 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series progress" 
  ON public.user_series 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert some sample series data
INSERT INTO public.series (title, description, total_episodes, genre, release_year, imdb_rating) VALUES 
('Breaking Bad', 'A chemistry teacher turned meth manufacturer partners with a former student to secure his family''s financial future.', 62, 'Crime, Drama, Thriller', 2008, 9.5),
('Stranger Things', 'A group of kids in a small town uncover supernatural mysteries and government conspiracies.', 42, 'Drama, Fantasy, Horror', 2016, 8.7),
('The Crown', 'The reign of Queen Elizabeth II from the 1940s to modern times.', 60, 'Biography, Drama, History', 2016, 8.6),
('Game of Thrones', 'Nine noble families fight for control over the lands of Westeros.', 73, 'Action, Adventure, Drama', 2011, 9.2),
('The Office', 'A mockumentary on a group of typical office workers.', 201, 'Comedy', 2005, 9.0),
('Friends', 'Follows the personal and professional lives of six twenty to thirty-something friends.', 236, 'Comedy, Romance', 1994, 8.9),
('Better Call Saul', 'The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.', 63, 'Crime, Drama', 2015, 8.8),
('The Mandalorian', 'The travels of a lone bounty hunter in the outer reaches of the galaxy.', 24, 'Action, Adventure, Fantasy', 2019, 8.7);
