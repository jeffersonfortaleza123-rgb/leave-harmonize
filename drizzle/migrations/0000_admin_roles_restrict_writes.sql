CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Public delete ferias" ON public.ferias;
DROP POLICY IF EXISTS "Public insert ferias" ON public.ferias;
DROP POLICY IF EXISTS "Public update ferias" ON public.ferias;
DROP POLICY IF EXISTS "Public delete habilitacoes" ON public.habilitacoes;
DROP POLICY IF EXISTS "Public insert habilitacoes" ON public.habilitacoes;
DROP POLICY IF EXISTS "Public update habilitacoes" ON public.habilitacoes;

CREATE POLICY "Admins insert ferias" ON public.ferias FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update ferias" ON public.ferias FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete ferias" ON public.ferias FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert habilitacoes" ON public.habilitacoes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update habilitacoes" ON public.habilitacoes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete habilitacoes" ON public.habilitacoes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));