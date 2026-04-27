ALTER TABLE public.vera_handoff_queue REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vera_handoff_queue;