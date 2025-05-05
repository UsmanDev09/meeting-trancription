-- Create meeting transcripts table
CREATE TABLE IF NOT EXISTS public.meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL,
  url TEXT NOT NULL,
  transcript TEXT,
  status TEXT DEFAULT 'pending',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT meeting_id_unique UNIQUE (meeting_id)
);

-- Create bot sessions table to track bot usage
CREATE TABLE IF NOT EXISTS public.bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meeting_id TEXT NOT NULL,
  meeting_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for meeting_transcripts
CREATE POLICY "Users can view meeting transcripts they have access to"
  ON public.meeting_transcripts
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bot_sessions
    WHERE bot_sessions.meeting_id = meeting_transcripts.meeting_id
    AND bot_sessions.user_id = auth.uid()
  ));

-- Create policies for bot_sessions
CREATE POLICY "Users can view their own bot sessions"
  ON public.bot_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bot sessions"
  ON public.bot_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_meeting_transcripts_updated_at
  BEFORE UPDATE ON public.meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_bot_sessions_updated_at
  BEFORE UPDATE ON public.bot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 