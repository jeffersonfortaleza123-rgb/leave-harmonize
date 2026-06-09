export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export type Ferias = {
  id: string;
  nome: string;
  matricula: string;
  mes: number;
  data_inicio: string;
  data_termino: string;
  observacoes: string | null;
  created_at: string;
};

export type FeriasStatus = "futura" | "andamento" | "encerrada";

export function getStatus(inicio: string, termino: string): FeriasStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(inicio + "T00:00:00");
  const end = new Date(termino + "T00:00:00");
  if (today < start) return "futura";
  if (today > end) return "encerrada";
  return "andamento";
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
