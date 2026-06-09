
CREATE TABLE public.ferias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  matricula TEXT NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  data_inicio DATE NOT NULL,
  data_termino DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ferias TO anon, authenticated;
GRANT ALL ON public.ferias TO service_role;

ALTER TABLE public.ferias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ferias" ON public.ferias FOR SELECT USING (true);
CREATE POLICY "Public insert ferias" ON public.ferias FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ferias" ON public.ferias FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete ferias" ON public.ferias FOR DELETE USING (true);

CREATE INDEX idx_ferias_mes ON public.ferias(mes);
CREATE INDEX idx_ferias_data_inicio ON public.ferias(data_inicio);
