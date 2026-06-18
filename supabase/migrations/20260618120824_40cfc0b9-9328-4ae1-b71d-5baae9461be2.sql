
CREATE TABLE public.habilitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula text NOT NULL UNIQUE,
  nome text NOT NULL,
  posto text,
  categorias text[] NOT NULL DEFAULT '{}',
  piloto_drone boolean NOT NULL DEFAULT false,
  piloto_embarcacao boolean NOT NULL DEFAULT false,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.habilitacoes TO anon, authenticated;
GRANT ALL ON public.habilitacoes TO service_role;

ALTER TABLE public.habilitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read habilitacoes" ON public.habilitacoes FOR SELECT USING (true);
CREATE POLICY "Public insert habilitacoes" ON public.habilitacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update habilitacoes" ON public.habilitacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete habilitacoes" ON public.habilitacoes FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER habilitacoes_set_updated_at BEFORE UPDATE ON public.habilitacoes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
