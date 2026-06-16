import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, CalendarDays } from "lucide-react";
import { MESES, type Ferias, getStatus, formatDate, postoRank } from "@/lib/ferias";
import { FeriasDialog } from "./FeriasDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  registros: Ferias[];
  onChanged: () => void;
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

export function MesAccordion({ registros, onChanged }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ferias | null>(null);
  const [defaultMes, setDefaultMes] = useState(1);

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
    const { error } = await supabase.from("ferias").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Registro removido");
    onChanged();
  }

  const porMes = (m: number) =>
    registros
      .filter((r) => r.mes === m)
      .sort((a, b) => {
        const pa = postoRank(a.posto);
        const pb = postoRank(b.posto);
        if (pa !== pb) return pa - pb;
        return (a.data_inicio ?? "9999").localeCompare(b.data_inicio ?? "9999");
      });

  return (
    <>
      <Accordion type="multiple" className="grid gap-3">
        {MESES.map((mes, i) => {
          const idx = i + 1;
          const itens = porMes(idx);
          return (
            <AccordionItem
              key={idx}
              value={`m-${idx}`}
              className="rounded-2xl border bg-card shadow-card overflow-hidden data-[state=open]:shadow-pop transition-shadow"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline group">
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent-foreground/60 text-primary-foreground grid place-items-center font-display font-semibold shadow-sm">
                      {String(idx).padStart(2, "0")}
                    </div>
                    <div className="text-left">
                      <div className="font-display text-lg font-semibold">{mes}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {itens.length === 0 ? "Sem registros" : `${itens.length} período${itens.length > 1 ? "s" : ""} agendado${itens.length > 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pr-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                      <Users className="h-3.5 w-3.5" /> {itens.length}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{itens.length}</span> pessoa{itens.length === 1 ? "" : "s"} cadastrada{itens.length === 1 ? "" : "s"} em {mes}
                  </p>
                  <Button size="sm" onClick={() => openCreate(idx)}>
                    <Plus className="h-4 w-4" /> Adicionar Férias
                  </Button>
                </div>

                {itens.length === 0 ? (
                  <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                    Nenhum registro para {mes}. Clique em <span className="font-medium text-foreground">Adicionar Férias</span> para começar.
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead>Posto/Grad</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Término</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Observações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itens.map((f) => {
                          const status = getStatus(f.data_inicio, f.data_termino);
                          return (
                            <TableRow key={f.id}>
                              <TableCell>
                                {f.posto ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary ring-1 ring-primary/20">
                                    {f.posto}
                                  </span>
                                ) : <span className="text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="font-medium">{f.nome}</TableCell>
                              <TableCell className="text-muted-foreground">{f.matricula}</TableCell>
                              <TableCell>{formatDate(f.data_inicio)}</TableCell>
                              <TableCell>{formatDate(f.data_termino)}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                                  {STATUS_LABEL[status]}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-[220px] truncate text-muted-foreground" title={f.observacoes ?? ""}>
                                {f.observacoes || "—"}
                              </TableCell>
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
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <FeriasDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultMes={defaultMes}
        editing={editing}
        onSaved={onChanged}
      />
    </>
  );
}
