import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Flame, Shield, Siren, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MesAccordion } from "@/components/MesAccordion";
import { MESES, type Ferias, formatDate, getStatus } from "@/lib/ferias";
import { Toaster } from "@/components/ui/sonner";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import brasaoAsset from "@/assets/brasao.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle de Férias - 3º GB" },
      { name: "description", content: "Painel de controle de férias do 3º Grupamento de Bombeiros, com busca instantânea por matrícula e visualização por mês." },
      { property: "og:title", content: "Controle de Férias - 3º GB" },
      { property: "og:description", content: "Painel de controle de férias do 3º Grupamento de Bombeiros." },
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

  const q = search.trim().toLowerCase();

  // Global search hits — group by militar (matricula)
  const searchGroups = useMemo(() => {
    if (!q) return [];
    const hits = registros.filter(
      (r) => r.matricula.toLowerCase().includes(q) || r.nome.toLowerCase().includes(q),
    );
    const byKey = new Map<string, { matricula: string; nome: string; posto: string | null; itens: Ferias[] }>();
    for (const r of hits) {
      const k = r.matricula + "|" + r.nome;
      const g = byKey.get(k) ?? { matricula: r.matricula, nome: r.nome, posto: r.posto, itens: [] };
      g.itens.push(r);
      byKey.set(k, g);
    }
    return Array.from(byKey.values())
      .map((g) => ({ ...g, itens: g.itens.sort((a, b) => a.mes - b.mes) }))
      .sort((a, b) => a.matricula.localeCompare(b.matricula));
  }, [registros, q]);

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />

      {/* HERO with brasão */}
      <div
        className="relative overflow-hidden border-b border-primary/20"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col items-center text-center">
          <img
            src={brasaoAsset.url}
            alt="Brasão 3º Grupamento de Bombeiros"
            className="h-28 sm:h-36 w-auto drop-shadow-2xl"
          />
          <div className="mt-4 inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-white/90 uppercase tracking-[0.25em]">
            <Siren className="h-3.5 w-3.5" />
            3º Grupamento de Bombeiros
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Controle de Férias
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/80">
            Gestão do efetivo organizada por mês, com busca instantânea por matrícula ou nome de guerra.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite a matrícula ou nome de guerra para localizar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base bg-card shadow-card border-border focus-visible:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2 px-4 h-12 rounded-md bg-card border shadow-card text-sm whitespace-nowrap">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-bold">{registros.length}</span>
            <span className="text-muted-foreground">registros</span>
          </div>
        </div>

        {/* Live search results */}
        {q && (
          <div className="mt-4 rounded-2xl border bg-card shadow-pop overflow-hidden animate-in fade-in slide-in-from-top-1">
            <div className="px-4 py-3 border-b bg-primary/5 flex items-center justify-between">
              <div className="text-sm font-semibold">
                {searchGroups.length} {searchGroups.length === 1 ? "militar encontrado" : "militares encontrados"}
              </div>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            </div>
            {searchGroups.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center">
                Nenhum militar localizado para "{search}".
              </div>
            ) : (
              <ul className="divide-y">
                {searchGroups.map((g) => (
                  <li key={g.matricula + g.nome} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-sm font-bold text-primary">{g.matricula}</span>
                      {g.posto && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary ring-1 ring-primary/20">
                          {g.posto}
                        </span>
                      )}
                      <span className="font-semibold uppercase tracking-wide">{g.nome}</span>
                    </div>
                    <div className="mt-2 text-xs font-medium text-muted-foreground">
                      Férias cadastradas:
                    </div>
                    <ul className="mt-1 grid sm:grid-cols-2 gap-1.5">
                      {g.itens.map((it) => {
                        const status = getStatus(it.data_inicio, it.data_termino);
                        return (
                          <li
                            key={it.id}
                            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                              status === "andamento"
                                ? "bg-warning/15 border-warning/40"
                                : "bg-muted/40 border-border"
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-semibold">{MESES[it.mes - 1]}:</span>
                            <span className="text-muted-foreground">
                              {formatDate(it.data_inicio)} a {formatDate(it.data_termino)}
                            </span>
                            {status === "andamento" && (
                              <span className="ml-auto text-[10px] font-bold uppercase text-warning-foreground bg-warning/30 px-1.5 py-0.5 rounded">
                                Em férias
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-card shadow-card animate-pulse" />
              ))}
            </div>
          ) : (
            <MesAccordion registros={registros} onChanged={load} />
          )}
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-primary" />
          3º Grupamento de Bombeiros — Controle de Férias
        </footer>
      </div>
    </div>
  );
}
