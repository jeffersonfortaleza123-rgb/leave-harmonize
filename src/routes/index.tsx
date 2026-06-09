import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Palmtree, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MesAccordion } from "@/components/MesAccordion";
import type { Ferias } from "@/lib/ferias";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle de Férias" },
      { name: "description", content: "Gestão moderna de férias da equipe com cards expansíveis por mês." },
      { property: "og:title", content: "Controle de Férias" },
      { property: "og:description", content: "Gestão moderna de férias da equipe com cards expansíveis por mês." },
    ],
  }),
  component: Home,
});

function Home() {
  const [registros, setRegistros] = useState<Ferias[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data, error } = await supabase
      .from("ferias")
      .select("*")
      .order("data_inicio", { ascending: true });
    if (!error && data) setRegistros(data as Ferias[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registros;
    return registros.filter(
      (r) => r.nome.toLowerCase().includes(q) || r.matricula.toLowerCase().includes(q),
    );
  }, [registros, search]);

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="uppercase tracking-widest">Dashboard de RH</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            Controle de <span className="bg-gradient-to-r from-primary to-[oklch(0.62_0.16_220)] bg-clip-text text-transparent">Férias</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Acompanhe os períodos de férias da equipe em um único lugar. Expanda o mês para visualizar, cadastrar ou editar registros — sem trocar de tela.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-card shadow-card border-border"
              />
            </div>
            <div className="flex items-center gap-2 px-4 h-11 rounded-md bg-card border shadow-card text-sm">
              <Palmtree className="h-4 w-4 text-primary" />
              <span className="font-medium">{registros.length}</span>
              <span className="text-muted-foreground">{registros.length === 1 ? "registro" : "registros"} no ano</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card shadow-card animate-pulse" />
            ))}
          </div>
        ) : (
          <MesAccordion registros={filtered} onChanged={load} />
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Atualização instantânea • Ordenado por data de início
        </footer>
      </div>
    </div>
  );
}
