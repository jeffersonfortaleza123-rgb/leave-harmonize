export const CATEGORIAS = ["A", "B", "C", "D", "E"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export type Habilitacao = {
  id: string;
  matricula: string;
  nome: string;
  posto: string | null;
  categorias: string[];
  piloto_drone: boolean;
  piloto_embarcacao: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};
