import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Search, X, ChevronDown, ArrowUpDown } from "lucide-react";
import { MESES, type Ferias, getStatus, formatDate, postoRank } from "@/lib/ferias";
import { FeriasDialog } from "./FeriasDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-auth";
import { toast } from "sonner";

type SortKey = "matricula" | "posto" | "nome";

type Props = {
  registros: Ferias[];
  setRegistros: React.Dispatch<React.SetStateAction<Ferias[]>>;
};

const STATUS_STYLES: Record<string, string> = {
  futura: "bg-success/15 text-success-foreground ring-1 ring-success/30",
  andamento: "bg-warning/20 text-warning-foreground ring-1 ring-warning/40",
  encerrada: "bg-neutral/15 text-neutral ring-1 ring-neutral/30",
  pendente: "bg-muted text-muted-foreground ring-1 ring-border",
};
const STATUS_DOT: Record<string, string> = {
  futura: "bg-success",
  andamento: "bg-warning",
  encerrada: "bg-neutral",
  pendente: "bg-muted-foreground",
};
const STATUS_LABEL: Record<string, string> = {
  futura: "Futura",
  andamento: "Em andamento",
  encerrada: "Encerrada",
  pendente: "Sem data",
};

export function MesAccordion({ registros, setRegistros }: Props) {
  const { isAdmin } = useAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ferias | null>(null);
  const [defaultMes, setDefaultMes] = useState(1);
  const [openMes, setOpenMes] = useState<number | null>(null);
  const [mesSearch, setMesSearch] = useState<Record<number, string>>({});
  const [sortKey, setSortKey] = useState<SortKey>("posto");

  function openCreate(mes: number) {
    setEditing(null);
    setDefaultMes(mes);
    setDialogOpen(true);
  }
  function openEdit(f: Ferias) {
    setEditing(f);
    setDefaultMes(f.mes);
    setDialogOpen(true);
  }
  async function handleDelete(id: string) {
    const previous = registros;
    setRegistros((cur) => cur.filter((r) => r.id !== id));
    const { error } = await supabase.from("ferias").delete().eq("id", id);
    if (error) {
      setRegistros(previous);
      return toast.error(error.message);
    }
    toast.success("Registro removido");
  }

  const countsByMes = useMemo(() => {
    const c: Record<number, number> = {};
    for (const r of registros) c[r.mes] = (c[r.mes] ?? 0) + 1;
    return c;
  }, [registros]);

  const itensDoMes = useMemo(() => {
    if (openMes == null) return [] as Ferias[];
    const q = (mesSearch[openMes] ?? "").trim().toLowerCase();
    return registros
      .filter((r) => r.mes === openMes)
      .filter((r) => {
        if (!q) return true;
        return (
          r.matricula.toLowerCase().includes(q) ||
          r.nome.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortKey === "matricula") return a.matricula.localeCompare(b.matricula);
        if (sortKey === "nome") return a.nome.localeCompare(b.nome);
        const pa = postoRank(a.posto);
        const pb = postoRank(b.posto);
        if (pa !== pb) return pa - pb;
        return a.matricula.localeCompare(b.matricula);
      });
  }, [registros, openMes, mesSearch, sortKey]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {MESES.map((mes, i) => {
          const idx = i + 1;
          const total = countsByMes[idx] ?? 0;
          const isOpen = openMes === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setOpenMes(isOpen ? null : idx)}
              className={`group relative aspect-square rounded-2xl border bg-card shadow-card overflow-hidden text-left transition-all hover:shadow-pop hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                isOpen ? "ring-2 ring-primary shadow-pop" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.65_0.2_45)] text-primary-foreground grid place-items-center font-display font-bold shadow-sm">
                    {String(idx).padStart(2, "0")}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`}
                  />
                </div>
                <div>
                  <div className="font-display text-lg sm:text-xl font-semibold leading-tight">{mes}</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {total} {total === 1 ? "militar" : "militares"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {openMes != null && (
        <div className="mt-6 rounded-2xl border bg-card shadow-pop overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.65_0.2_45)] text-primary-foreground grid place-items-center font-display font-bold">
                {String(openMes).padStart(2, "0")}
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">{MESES[openMes - 1]}</h2>
                <p className="text-xs text-muted-foreground">
                  {countsByMes[openMes] ?? 0} militar(es) cadastrado(s)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button size="sm" onClick={() => openCreate(openMes!)}>
                  <Plus className="h-4 w-4" /> Adicionar
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => setOpenMes(null)} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por matrícula ou nome de guerra..."
                  value={mesSearch[openMes] ?? ""}
                  onChange={(e) => setMesSearch((s) => ({ ...s, [openMes!]: e.target.value }))}
                  className="pl-9 h-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posto">Ordenar por Posto/Grad</SelectItem>
                    <SelectItem value="matricula">Ordenar por Matrícula</SelectItem>
                    <SelectItem value="nome">Ordenar por Nome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {itensDoMes.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                Nenhum militar encontrado em {MESES[openMes - 1]}.
              </div>
            ) : (
              <div className="rounded-xl border overflow-x-auto bg-background">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Posto/Grad</TableHead>
                      <TableHead>Nome de Guerra</TableHead>
                      <TableHead>Início das férias</TableHead>
                      <TableHead>Término das férias</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                      {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensDoMes.map((f) => {
                      const status = getStatus(f.data_inicio, f.data_termino);
                      return (
                        <TableRow key={f.id} className={status === "andamento" ? "bg-warning/10 hover:bg-warning/15" : ""}>
                          <TableCell className="font-mono text-sm font-semibold">{f.matricula}</TableCell>
                          <TableCell>
                            {f.posto ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary ring-1 ring-primary/20 whitespace-nowrap">
                                {f.posto}
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="font-medium">{f.nome}</TableCell>
                          <TableCell>{formatDate(f.data_inicio)}</TableCell>
                          <TableCell>{formatDate(f.data_termino)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status]}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                              {STATUS_LABEL[status]}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-muted-foreground" title={f.observacoes ?? ""}>
                            {f.observacoes || "—"}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={() => openEdit(f)}>
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
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      <FeriasDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultMes={defaultMes}
        editing={editing}
        registros={registros}
        setRegistros={setRegistros}
      />
    </>
  );
}
