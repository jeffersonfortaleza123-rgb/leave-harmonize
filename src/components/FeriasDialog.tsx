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
  onSaved: () => void;
};

export function FeriasDialog({ open, onOpenChange, defaultMes = 1, editing, onSaved }: Props) {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [posto, setPosto] = useState<string>("");
  const [mes, setMes] = useState<number>(defaultMes);
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setNome(editing.nome);
        setMatricula(editing.matricula);
        setPosto(editing.posto ?? "");
        setMes(editing.mes);
        setDataInicio(editing.data_inicio ?? "");
        setDataTermino(editing.data_termino ?? "");
        setObservacoes(editing.observacoes ?? "");
      } else {
        setNome("");
        setMatricula("");
        setPosto("");
        setMes(defaultMes);
        setDataInicio("");
        setDataTermino("");
        setObservacoes("");
      }
    }
  }, [open, editing, defaultMes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !matricula) {
      toast.error("Informe nome e matrícula");
      return;
    }
    if (dataInicio && dataTermino && dataTermino < dataInicio) {
      toast.error("Data de término deve ser posterior à de início");
      return;
    }
    setSaving(true);
    const payload = {
      nome: nome.trim(),
      matricula: matricula.trim(),
      posto: posto || null,
      mes,
      data_inicio: dataInicio || null,
      data_termino: dataTermino || null,
      observacoes: observacoes.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("ferias").update(payload).eq("id", editing.id)
      : await supabase.from("ferias").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Férias atualizadas" : "Férias cadastradas");
    onSaved();
    onOpenChange(false);
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
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Posto / Graduação</Label>
              <Select value={posto} onValueChange={setPosto}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {POSTOS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="ini">Data de início</Label>
              <Input id="ini" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fim">Data de término</Label>
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
