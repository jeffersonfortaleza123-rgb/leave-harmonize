ALTER TABLE public.ferias REPLICA IDENTITY FULL;
ALTER TABLE public.habilitacoes REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ferias; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.habilitacoes; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;