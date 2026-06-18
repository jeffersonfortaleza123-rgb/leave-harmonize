import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MESES, POSTOS, type Ferias } from "@/lib/ferias";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultMes?: number;
  editing?: Ferias | null;
  registros: Ferias[];
  setRegistros: React.Dispatch<React.SetStateAction<Ferias[]>>;
};

export function FeriasDialog({ open, onOpenChange, defaultMes = 1, editing, registros, setRegistros }: Props) {
  const [matricula, setMatricula] = useState("");
  const [posto, setPosto] = useState<string>("");
  const [nome, setNome] = useState("");
  const [mes, setMes] = useState<number>(defaultMes);
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

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
    } else {
      setMatricula(""); setPosto(""); setNome(""); setMes(defaultMes);
      setDataInicio(""); setDataTermino(""); setObservacoes("");
    }
  }, [open, editing, defaultMes]);

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
    // Prevent duplicating the same militar in two months
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
    setSaving(false);
    if (error) {
      setRegistros(previous);
      toast.error(`Erro ao salvar: ${error.message}`);
      return;
    }
    if (data) {
      setRegistros((cur) => cur.map((r) => (r.id === optimistic.id ? (data as Ferias) : r)));
    }
    toast.success(editing ? "Férias atualizadas" : "Férias cadastradas");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Editar férias" : "Adicionar férias"}
          </DialogTitle>
          <DialogDescription>
            Informe os dados do militar e o período de afastamento.
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
