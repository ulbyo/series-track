
-- Create table for scheduled watch sessions
CREATE TABLE public.watch_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  series_id UUID REFERENCES public.series NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  episode_number INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for watch goals/targets
CREATE TABLE public.watch_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  series_id UUID REFERENCES public.series NOT NULL,
  target_episodes_per_week INTEGER DEFAULT 1,
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- Enable Row Level Security
ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for watch_sessions
CREATE POLICY "Users can view their own watch sessions" 
  ON public.watch_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watch sessions" 
  ON public.watch_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch sessions" 
  ON public.watch_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch sessions" 
  ON public.watch_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for watch_goals
CREATE POLICY "Users can view their own watch goals" 
  ON public.watch_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watch goals" 
  ON public.watch_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch goals" 
  ON public.watch_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch goals" 
  ON public.watch_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);
