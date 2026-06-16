export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const POSTOS = [
  "CEL", "TEN CEL", "MAJ", "CAP", "1º TEN", "2º TEN",
  "SUB", "1º SGT", "2º SGT", "3º SGT", "CB", "SD",
] as const;

export type Posto = (typeof POSTOS)[number];

export type Ferias = {
  id: string;
  nome: string;
  matricula: string;
  posto: string | null;
  mes: number;
  data_inicio: string | null;
  data_termino: string | null;
  observacoes: string | null;
  created_at: string;
};

export type FeriasStatus = "futura" | "andamento" | "encerrada" | "pendente";

export function getStatus(inicio: string | null, termino: string | null): FeriasStatus {
  if (!inicio || !termino) return "pendente";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(inicio + "T00:00:00");
  const end = new Date(termino + "T00:00:00");
  if (today < start) return "futura";
  if (today > end) return "encerrada";
  return "andamento";
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const POSTO_ORDER: Record<string, number> = Object.fromEntries(POSTOS.map((p, i) => [p, i]));
export function postoRank(p: string | null): number {
  if (!p) return 999;
  return POSTO_ORDER[p] ?? 998;
}
