import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POSTOS } from "@/lib/ferias";
import { CATEGORIAS, type Habilitacao } from "@/lib/habilitacoes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Habilitacao | null;
  registros: Habilitacao[];
  setRegistros: React.Dispatch<React.SetStateAction<Habilitacao[]>>;
};

export function HabilitacaoDialog({ open, onOpenChange, editing, registros, setRegistros }: Props) {
  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [posto, setPosto] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [drone, setDrone] = useState(false);
  const [embarcacao, setEmbarcacao] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setMatricula(editing.matricula);
      setNome(editing.nome);
      setPosto(editing.posto ?? "");
      setCategorias(editing.categorias ?? []);
      setDrone(editing.piloto_drone);
      setEmbarcacao(editing.piloto_embarcacao);
      setObservacoes(editing.observacoes ?? "");
    } else {
      setMatricula(""); setNome(""); setPosto(""); setCategorias([]);
      setDrone(false); setEmbarcacao(false); setObservacoes("");
    }
  }, [open, editing]);

  function toggleCat(c: string) {
    setCategorias((cur) => cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matricula.trim() || !nome.trim() || !posto) {
      toast.error("Matrícula, Posto/Graduação e Nome de Guerra são obrigatórios");
      return;
    }
    const matNorm = matricula.trim();
    const dup = registros.find((r) => r.matricula === matNorm && r.id !== editing?.id);
    if (dup) {
      toast.error("Já existe um militar com essa matrícula nas habilitações");
      return;
    }

    setSaving(true);
    const previous = registros;
    const optimistic: Habilitacao = {
      id: editing?.id ?? `tmp-${Date.now()}`,
      matricula: matNorm,
      nome: nome.trim(),
      posto,
      categorias,
      piloto_drone: drone,
      piloto_embarcacao: embarcacao,
      observacoes: observacoes.trim() || null,
      created_at: editing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRegistros((cur) =>
      editing ? cur.map((r) => (r.id === editing.id ? optimistic : r)) : [...cur, optimistic],
    );
    onOpenChange(false);

    const payload = {
      matricula: matNorm,
      nome: nome.trim(),
      posto,
      categorias,
      piloto_drone: drone,
      piloto_embarcacao: embarcacao,
      observacoes: observacoes.trim() || null,
    };
    const { data, error } = editing
      ? await supabase.from("habilitacoes").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("habilitacoes").insert(payload).select().single();
    setSaving(false);
    if (error) {
      setRegistros(previous);
      toast.error(error.message);
      return;
    }
    if (data) {
      setRegistros((cur) => cur.map((r) => (r.id === optimistic.id ? (data as Habilitacao) : r)));
    }
    toast.success(editing ? "Habilitação atualizada" : "Habilitação cadastrada");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Editar habilitação" : "Adicionar habilitação"}
          </DialogTitle>
          <DialogDescription>Categorias de veículo e qualificações operacionais do militar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Matrícula *</Label>
            <Input value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Posto / Graduação *</Label>
            <Select value={posto} onValueChange={setPosto}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {POSTOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Nome de Guerra *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Categorias de veículo</Label>
            <div className="flex flex-wrap gap-3 rounded-md border p-3">
              {CATEGORIAS.map((c) => (
                <label key={c} className="inline-flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={categorias.includes(c)} onCheckedChange={() => toggleCat(c)} />
                  <span className="font-semibold">{c}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border p-3 cursor-pointer">
              <Checkbox checked={drone} onCheckedChange={(v) => setDrone(Boolean(v))} />
              <span className="text-sm font-medium">Piloto de drone</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-md border p-3 cursor-pointer">
              <Checkbox checked={embarcacao} onCheckedChange={(v) => setEmbarcacao(Boolean(v))} />
              <span className="text-sm font-medium">Piloto de embarcação</span>
            </label>
          </div>
          <div className="grid gap-2">
            <Label>Observações</Label>
            <Textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
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
