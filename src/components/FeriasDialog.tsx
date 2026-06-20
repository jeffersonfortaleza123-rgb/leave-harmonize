import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Ship, Car } from "lucide-react";
import { MESES, POSTOS, type Ferias } from "@/lib/ferias";
import { CATEGORIAS, type Habilitacao } from "@/lib/habilitacoes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultMes?: number;
  editing?: Ferias | null;
  registros: Ferias[];
  setRegistros: React.Dispatch<React.SetStateAction<Ferias[]>>;
  habilitacoes: Habilitacao[];
  setHabilitacoes: React.Dispatch<React.SetStateAction<Habilitacao[]>>;
};

export function FeriasDialog({
  open, onOpenChange, defaultMes = 1, editing, registros, setRegistros,
  habilitacoes, setHabilitacoes,
}: Props) {
  const [matricula, setMatricula] = useState("");
  const [posto, setPosto] = useState<string>("");
  const [nome, setNome] = useState("");
  const [mes, setMes] = useState<number>(defaultMes);
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [drone, setDrone] = useState(false);
  const [embarcacao, setEmbarcacao] = useState(false);
  const [saving, setSaving] = useState(false);

  const habByMat = useMemo(() => {
    const m = new Map<string, Habilitacao>();
    for (const h of habilitacoes) m.set(h.matricula, h);
    return m;
  }, [habilitacoes]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setMatricula(editing.matricula);
      setPosto(editing.posto ?? "");
      setNome(editing.nome);
      setMes(editing.mes);
      setDataInicio(editing.data_inicio ?? "");
      setDataTermino(editing.data_termino ?? "");
      setObservacoes(editing.observacoes ?? "");
      const h = habByMat.get(editing.matricula);
      setCategorias(h?.categorias ?? []);
      setDrone(h?.piloto_drone ?? false);
      setEmbarcacao(h?.piloto_embarcacao ?? false);
    } else {
      setMatricula(""); setPosto(""); setNome(""); setMes(defaultMes);
      setDataInicio(""); setDataTermino(""); setObservacoes("");
      setCategorias([]); setDrone(false); setEmbarcacao(false);
    }
  }, [open, editing, defaultMes, habByMat]);

  // When matricula changes (creating new), prefill qualifications if already cadastradas
  useEffect(() => {
    if (!open || editing) return;
    const h = habByMat.get(matricula.trim());
    if (h) {
      setCategorias(h.categorias ?? []);
      setDrone(h.piloto_drone);
      setEmbarcacao(h.piloto_embarcacao);
    }
  }, [matricula, open, editing, habByMat]);

  function toggleCat(c: string) {
    setCategorias((cur) => cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matricula.trim() || !posto || !nome.trim()) {
      toast.error("Matrícula, Posto/Graduação e Nome de Guerra são obrigatórios");
      return;
    }
    if (dataInicio && dataTermino && dataTermino < dataInicio) {
      toast.error("Data de término deve ser posterior à de início");
      return;
    }
    const matNorm = matricula.trim();
    const dup = registros.find(
      (r) => r.matricula === matNorm && r.mes === mes && r.id !== editing?.id,
    );
    if (dup) {
      toast.error(`Este militar já possui férias cadastradas em ${MESES[mes - 1]}.`);
      return;
    }

    setSaving(true);
    const previous = registros;
    const optimistic: Ferias = {
      id: editing?.id ?? `tmp-${Date.now()}`,
      matricula: matNorm,
      posto,
      nome: nome.trim(),
      mes,
      data_inicio: dataInicio || null,
      data_termino: dataTermino || null,
      observacoes: observacoes.trim() || null,
      created_at: editing?.created_at ?? new Date().toISOString(),
    };
    setRegistros((cur) =>
      editing ? cur.map((r) => (r.id === editing.id ? optimistic : r)) : [...cur, optimistic],
    );
    onOpenChange(false);

    const payload = {
      matricula: matNorm,
      posto,
      nome: nome.trim(),
      mes,
      data_inicio: dataInicio || null,
      data_termino: dataTermino || null,
      observacoes: observacoes.trim() || null,
    };
    const { data, error } = editing
      ? await supabase.from("ferias").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("ferias").insert(payload).select().single();
    if (error) {
      setSaving(false);
      setRegistros(previous);
      toast.error(`Erro ao salvar: ${error.message}`);
      return;
    }
    if (data) {
      setRegistros((cur) => cur.map((r) => (r.id === optimistic.id ? (data as Ferias) : r)));
    }

    // Upsert habilitação for the militar (by matricula)
    const existingHab = habByMat.get(matNorm);
    const habPayload = {
      matricula: matNorm,
      nome: nome.trim(),
      posto,
      categorias,
      piloto_drone: drone,
      piloto_embarcacao: embarcacao,
    };
    const { data: habData, error: habErr } = existingHab
      ? await supabase.from("habilitacoes").update(habPayload).eq("id", existingHab.id).select().single()
      : await supabase.from("habilitacoes").insert(habPayload).select().single();
    setSaving(false);
    if (habErr) {
      toast.error(`Férias salvas, mas habilitação falhou: ${habErr.message}`);
    } else if (habData) {
      setHabilitacoes((cur) => {
        const idx = cur.findIndex((h) => h.id === (habData as Habilitacao).id);
        if (idx >= 0) {
          const next = cur.slice();
          next[idx] = habData as Habilitacao;
          return next;
        }
        return [...cur, habData as Habilitacao];
      });
    }
    toast.success(editing ? "Férias atualizadas" : "Férias cadastradas");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Editar férias" : "Adicionar férias"}
          </DialogTitle>
          <DialogDescription>
            Informe os dados do militar, o período de afastamento e suas qualificações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Posto / Graduação *</Label>
            <Select value={posto} onValueChange={setPosto}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {POSTOS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome de Guerra *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Mês</Label>
            <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MESES.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="ini">Início das férias</Label>
              <Input id="ini" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fim">Término das férias</Label>
              <Input id="fim" type="date" value={dataTermino} onChange={(e) => setDataTermino(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5"><Car className="h-4 w-4 text-primary" /> Categoria de Habilitação</Label>
            <div className="flex flex-wrap gap-2 rounded-md border p-3 bg-muted/30">
              {CATEGORIAS.map((c) => {
                const on = categorias.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCat(c)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ring-1 transition ${
                      on
                        ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                        : "bg-card text-foreground ring-border hover:ring-primary/40"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">Seleção múltipla — clique para marcar/desmarcar.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40 transition">
              <Checkbox checked={drone} onCheckedChange={(v) => setDrone(Boolean(v))} />
              <Plane className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Piloto de drone</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40 transition">
              <Checkbox checked={embarcacao} onCheckedChange={(v) => setEmbarcacao(Boolean(v))} />
              <Ship className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Piloto de embarcação</span>
            </label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea id="obs" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
