ALTER TABLE public.ferias ADD COLUMN IF NOT EXISTS posto text;
ALTER TABLE public.ferias ALTER COLUMN data_inicio DROP NOT NULL;
ALTER TABLE public.ferias ALTER COLUMN data_termino DROP NOT NULL;