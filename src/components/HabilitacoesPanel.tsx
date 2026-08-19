import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Plane, Ship, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-auth";
import { toast } from "sonner";
import { CATEGORIAS, type Habilitacao } from "@/lib/habilitacoes";
import { postoRank } from "@/lib/ferias";
import { HabilitacaoDialog } from "./HabilitacaoDialog";

export function HabilitacoesPanel() {
  const { isAdmin } = useAdmin();
  const [registros, setRegistros] = useState<Habilitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterDrone, setFilterDrone] = useState(false);
  const [filterEmb, setFilterEmb] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Habilitacao | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("habilitacoes")
      .select("*")
      .order("matricula", { ascending: true });
    if (!error && data) setRegistros(data as Habilitacao[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
    const channel = supabase
      .channel("realtime-habilitacoes-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "habilitacoes" }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleDelete(item: Habilitacao) {
    const previous = registros;
    setRegistros((cur) => cur.filter((r) => r.id !== item.id));
    const { error } = await supabase.from("habilitacoes").delete().eq("id", item.id);
    if (error) {
      setRegistros(previous);
      return toast.error(error.message);
    }
    toast.success("Habilitação removida");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registros
      .filter((r) => {
        if (q && !r.matricula.toLowerCase().includes(q) && !r.nome.toLowerCase().includes(q)) return false;
        if (filterCat && !r.categorias.includes(filterCat)) return false;
        if (filterDrone && !r.piloto_drone) return false;
        if (filterEmb && !r.piloto_embarcacao) return false;
        return true;
      })
      .sort((a, b) => {
        const pa = postoRank(a.posto); const pb = postoRank(b.posto);
        if (pa !== pb) return pa - pb;
        return a.matricula.localeCompare(b.matricula);
      });
  }, [registros, search, filterCat, filterDrone, filterEmb]);

  const stats = useMemo(() => ({
    total: registros.length,
    drone: registros.filter((r) => r.piloto_drone).length,
    emb: registros.filter((r) => r.piloto_embarcacao).length,
  }), [registros]);

  return (
    <div className="rounded-2xl border bg-card shadow-pop overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.65_0.2_45)] text-primary-foreground grid place-items-center">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Habilitações & Qualificações</h2>
            <p className="text-xs text-muted-foreground">
              {stats.total} militar(es) · {stats.drone} piloto(s) de drone · {stats.emb} piloto(s) de embarcação
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por matrícula ou nome de guerra..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterCat(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filterCat === null ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
            >Todas categorias</button>
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCat(filterCat === c ? null : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${filterCat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
              >Cat. {c}</button>
            ))}
            <button
              type="button"
              onClick={() => setFilterDrone((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filterDrone ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
            ><Plane className="h-3 w-3" /> Drone</button>
            <button
              type="button"
              onClick={() => setFilterEmb((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filterEmb ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
            ><Ship className="h-3 w-3" /> Embarcação</button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nenhuma habilitação encontrada.
          </div>
        ) : (
          <div className="rounded-xl border overflow-x-auto bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Posto/Grad</TableHead>
                  <TableHead>Nome de Guerra</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead>Qualificações</TableHead>
                  <TableHead>Observações</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-sm font-semibold">{h.matricula}</TableCell>
                    <TableCell>
                      {h.posto ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary ring-1 ring-primary/20 whitespace-nowrap">
                          {h.posto}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="font-medium">{h.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {h.categorias.length === 0 ? <span className="text-muted-foreground text-xs">—</span> : h.categorias.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-secondary text-secondary-foreground ring-1 ring-border">{c}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {h.piloto_drone && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent text-accent-foreground ring-1 ring-primary/20">
                            <Plane className="h-3 w-3" /> Drone
                          </span>
                        )}
                        {h.piloto_embarcacao && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent text-accent-foreground ring-1 ring-primary/20">
                            <Ship className="h-3 w-3" /> Embarcação
                          </span>
                        )}
                        {!h.piloto_drone && !h.piloto_embarcacao && <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={h.observacoes ?? ""}>
                      {h.observacoes || "—"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(h); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir habilitação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação removerá permanentemente a habilitação de {h.nome}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(h)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <HabilitacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        registros={registros}
        setRegistros={setRegistros}
      />
    </div>
  );
}
