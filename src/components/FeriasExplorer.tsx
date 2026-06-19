import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays, ChevronRight, Plus, Pencil, Trash2, Search, Users,
  Plane, Ship, Car, ArrowUpDown, CalendarCheck2, CalendarClock, CalendarX2,
  FileText, Filter, X,
} from "lucide-react";
import { MESES, type Ferias, getStatus, formatDate, postoRank } from "@/lib/ferias";
import { CATEGORIAS, type Habilitacao } from "@/lib/habilitacoes";
import { FeriasDialog } from "./FeriasDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-auth";
import { toast } from "sonner";

type SortKey = "posto" | "matricula" | "nome";

type Props = {
  registros: Ferias[];
  setRegistros: React.Dispatch<React.SetStateAction<Ferias[]>>;
};

function yearOf(r: Ferias): number {
  if (r.data_inicio) return Number(r.data_inicio.slice(0, 4));
  return new Date(r.created_at).getFullYear();
}

const STATUS_META = {
  futura: { label: "Programada", dot: "bg-success", chip: "bg-success/15 text-success-foreground ring-success/30", icon: CalendarClock },
  andamento: { label: "Em férias", dot: "bg-warning", chip: "bg-warning/20 text-warning-foreground ring-warning/40", icon: CalendarCheck2 },
  encerrada: { label: "Encerrada", dot: "bg-neutral", chip: "bg-neutral/15 text-neutral ring-neutral/30", icon: CalendarX2 },
  pendente: { label: "Sem data", dot: "bg-muted-foreground", chip: "bg-muted text-muted-foreground ring-border", icon: CalendarDays },
} as const;

export function FeriasExplorer({ registros, setRegistros }: Props) {
  const { isAdmin } = useAdmin();
  const [habilitacoes, setHabilitacoes] = useState<Habilitacao[]>([]);
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [openMes, setOpenMes] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("posto");
  const [filterCats, setFilterCats] = useState<string[]>([]);
  const [filterDrone, setFilterDrone] = useState(false);
  const [filterEmb, setFilterEmb] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ferias | null>(null);
  const [defaultMes, setDefaultMes] = useState(1);

  useEffect(() => {
    supabase.from("habilitacoes").select("*").then(({ data }) => {
      if (data) setHabilitacoes(data as Habilitacao[]);
    });
  }, []);

  const habByMat = useMemo(() => {
    const m = new Map<string, Habilitacao>();
    for (const h of habilitacoes) m.set(h.matricula, h);
    return m;
  }, [habilitacoes]);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const r of registros) set.add(yearOf(r));
    if (set.size === 0) set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [registros]);

  useEffect(() => {
    if (openYear == null && years.length) setOpenYear(years[0]);
  }, [years, openYear]);

  const regsByYear = useMemo(() => {
    const m = new Map<number, Ferias[]>();
    for (const r of registros) {
      const y = yearOf(r);
      if (!m.has(y)) m.set(y, []);
      m.get(y)!.push(r);
    }
    return m;
  }, [registros]);

  function yearStats(y: number) {
    const list = regsByYear.get(y) ?? [];
    let andamento = 0, futura = 0, encerrada = 0;
    for (const r of list) {
      const s = getStatus(r.data_inicio, r.data_termino);
      if (s === "andamento") andamento++;
      else if (s === "futura") futura++;
      else if (s === "encerrada") encerrada++;
    }
    return { total: list.length, andamento, futura, encerrada };
  }

  const countsByMes = useMemo(() => {
    const c: Record<number, number> = {};
    if (openYear == null) return c;
    for (const r of regsByYear.get(openYear) ?? []) c[r.mes] = (c[r.mes] ?? 0) + 1;
    return c;
  }, [regsByYear, openYear]);

  const itensDoMes = useMemo(() => {
    if (openYear == null || openMes == null) return [] as Ferias[];
    const q = search.trim().toLowerCase();
    return (regsByYear.get(openYear) ?? [])
      .filter((r) => r.mes === openMes)
      .filter((r) => !q || r.matricula.toLowerCase().includes(q) || r.nome.toLowerCase().includes(q))
      .filter((r) => {
        if (!filterCats.length && !filterDrone && !filterEmb) return true;
        const h = habByMat.get(r.matricula);
        if (filterCats.length && !filterCats.every((c) => h?.categorias?.includes(c))) return false;
        if (filterDrone && !h?.piloto_drone) return false;
        if (filterEmb && !h?.piloto_embarcacao) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortKey === "matricula") return a.matricula.localeCompare(b.matricula);
        if (sortKey === "nome") return a.nome.localeCompare(b.nome);
        const pa = postoRank(a.posto), pb = postoRank(b.posto);
        if (pa !== pb) return pa - pb;
        return a.matricula.localeCompare(b.matricula);
      });
  }, [regsByYear, openYear, openMes, search, sortKey, filterCats, filterDrone, filterEmb, habByMat]);

  const filtersActive = filterCats.length > 0 || filterDrone || filterEmb;
  function toggleCat(c: string) {
    setFilterCats((cur) => cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]);
  }
  function clearFilters() { setFilterCats([]); setFilterDrone(false); setFilterEmb(false); }

  function openCreate(mes: number) { setEditing(null); setDefaultMes(mes); setDialogOpen(true); }
  function openEdit(f: Ferias) { setEditing(f); setDefaultMes(f.mes); setDialogOpen(true); }
  async function handleDelete(id: string) {
    const previous = registros;
    setRegistros((cur) => cur.filter((r) => r.id !== id));
    const { error } = await supabase.from("ferias").delete().eq("id", id);
    if (error) { setRegistros(previous); return toast.error(error.message); }
    toast.success("Registro removido");
  }

  return (
    <div className="space-y-4">
      {/* LEVEL 1 — Years */}
      <div className="space-y-3">
        {years.map((y) => {
          const isOpen = openYear === y;
          const s = yearStats(y);
          return (
            <div
              key={y}
              className={`group rounded-2xl border bg-card shadow-card overflow-hidden transition-all ${
                isOpen ? "ring-1 ring-primary/40 shadow-pop" : "hover:shadow-pop hover:-translate-y-0.5"
              }`}
            >
              <button
                type="button"
                onClick={() => { setOpenYear(isOpen ? null : y); setOpenMes(null); }}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left focus:outline-none"
              >
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.65_0.2_45)] text-primary-foreground grid place-items-center font-display font-bold text-lg shadow-sm shrink-0">
                  {String(y).slice(2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl sm:text-2xl font-bold leading-tight">{y}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{s.total} militar(es)</span>
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />{s.andamento} em férias</span>
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />{s.futura} programada(s)</span>
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-neutral" />{s.encerrada} encerrada(s)</span>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-90 text-primary" : ""}`} />
              </button>

              {/* LEVEL 2 — Months */}
              {isOpen && (
                <div className="border-t bg-gradient-to-b from-primary/[0.03] to-transparent p-4 sm:p-5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {MESES.map((mes, i) => {
                      const idx = i + 1;
                      const total = countsByMes[idx] ?? 0;
                      const active = openMes === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOpenMes(active ? null : idx)}
                          className={`relative rounded-xl border bg-card p-3.5 text-left transition-all focus:outline-none ${
                            active
                              ? "ring-2 ring-primary shadow-pop -translate-y-0.5"
                              : "hover:border-primary/40 hover:shadow-card hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`h-8 w-8 rounded-lg grid place-items-center font-display font-bold text-xs ${
                              active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            }`}>
                              {String(idx).padStart(2, "0")}
                            </div>
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                              total > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            }`}>
                              {total}
                            </span>
                          </div>
                          <div className="mt-2 font-semibold text-sm">{mes}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {total === 0 ? "Nenhum militar" : `${total} militar(es)`}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* LEVEL 3 — Militaries */}
                  {openMes != null && (
                    <div className="mt-5 rounded-2xl border bg-card shadow-card overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.65_0.2_45)] text-primary-foreground grid place-items-center font-display font-bold shrink-0">
                            {String(openMes).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold truncate">{MESES[openMes - 1]} · {openYear}</h3>
                            <p className="text-xs text-muted-foreground">{itensDoMes.length} militar(es)</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button size="sm" onClick={() => openCreate(openMes!)}>
                            <Plus className="h-4 w-4" /> Adicionar
                          </Button>
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar por matrícula ou nome..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="pl-9 h-10"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                              <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="posto">Posto/Graduação</SelectItem>
                                <SelectItem value="matricula">Matrícula</SelectItem>
                                <SelectItem value="nome">Nome</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground mr-1">
                            <Filter className="h-3.5 w-3.5" /> Filtros
                          </span>
                          {CATEGORIAS.map((c) => {
                            const on = filterCats.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => toggleCat(c)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 transition ${
                                  on
                                    ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                                    : "bg-card text-foreground ring-border hover:ring-primary/40"
                                }`}
                              >
                                <Car className="h-3 w-3" /> {c}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setFilterDrone((v) => !v)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 transition ${
                              filterDrone
                                ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                                : "bg-card text-foreground ring-border hover:ring-primary/40"
                            }`}
                          >
                            <Plane className="h-3 w-3" /> Drone
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilterEmb((v) => !v)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 transition ${
                              filterEmb
                                ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                                : "bg-card text-foreground ring-border hover:ring-primary/40"
                            }`}
                          >
                            <Ship className="h-3 w-3" /> Embarcação
                          </button>
                          {filtersActive && (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" /> Limpar
                            </button>
                          )}
                        </div>

                        {itensDoMes.length === 0 ? (
                          <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                            Nenhum militar encontrado.
                          </div>
                        ) : (
                          <ul className="flex flex-col gap-2.5">
                            {itensDoMes.map((f) => {
                              const status = getStatus(f.data_inicio, f.data_termino);
                              const meta = STATUS_META[status];
                              const StatusIcon = meta.icon;
                              const hab = habByMat.get(f.matricula);
                              return (
                                <li
                                  key={f.id}
                                  className="group relative rounded-xl border bg-card pl-4 pr-3 py-3 shadow-card hover:shadow-pop transition-all"
                                >
                                  <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${meta.dot}`} />
                                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                    {/* Identidade */}
                                    <div className="flex items-center gap-3 min-w-0 lg:w-[300px] shrink-0">
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono text-sm font-bold text-primary">{f.matricula}</span>
                                          {f.posto && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary ring-1 ring-primary/20">
                                              {f.posto}
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-semibold uppercase tracking-wide truncate text-sm">{f.nome}</span>
                                      </div>
                                    </div>

                                    {/* Habilitações */}
                                    <div className="flex flex-wrap items-center gap-1 lg:flex-1 lg:min-w-0">
                                      {hab?.categorias?.map((c) => (
                                        <span key={c} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-accent-foreground ring-1 ring-accent-foreground/10">
                                          <Car className="h-3 w-3" /> {c}
                                        </span>
                                      ))}
                                      {hab?.piloto_drone && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary ring-1 ring-primary/20">
                                          <Plane className="h-3 w-3" /> Drone
                                        </span>
                                      )}
                                      {hab?.piloto_embarcacao && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary ring-1 ring-primary/20">
                                          <Ship className="h-3 w-3" /> Embarcação
                                        </span>
                                      )}
                                      {!hab?.categorias?.length && !hab?.piloto_drone && !hab?.piloto_embarcacao && (
                                        <span className="text-[10px] text-muted-foreground italic">sem habilitação</span>
                                      )}
                                    </div>

                                    {/* Datas */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground lg:w-[220px] shrink-0">
                                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                      <span className="whitespace-nowrap">
                                        {formatDate(f.data_inicio)} <span className="opacity-60">→</span> {formatDate(f.data_termino)}
                                      </span>
                                    </div>

                                    {/* Status + ações */}
                                    <div className="flex items-center justify-between lg:justify-end gap-2 lg:w-[200px] shrink-0">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 whitespace-nowrap ${meta.chip}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {meta.label}
                                      </span>
                                      {isAdmin && (
                                        <div className="flex items-center gap-0.5">
                                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(f)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Esta ação removerá permanentemente as férias de {f.nome}.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(f.id)}>Excluir</AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {f.observacoes && (
                                    <div className="mt-2 pt-2 border-t flex items-start gap-1.5 text-xs text-muted-foreground">
                                      <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                      <p className="line-clamp-2" title={f.observacoes}>{f.observacoes}</p>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FeriasDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultMes={defaultMes}
        editing={editing}
        registros={registros}
        setRegistros={setRegistros}
      />
    </div>
  );
}
