/**
 * Hook de queries para Destaques Turísticos (Highlights) usando TanStack Query.
 */
import { api } from "@/lib/api";
import { Highlight } from "@/types/Municipios";
import { useQuery } from "@tanstack/react-query";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const highlightKeys = {
  all: ["highlights"] as const,
  random: () => [...highlightKeys.all, "random"] as const,
  detail: (id: string) => [...highlightKeys.all, "detail", id] as const,
};

// ─── Formatador ───────────────────────────────────────────────────────────────

const formatHighlight = (data: any): Highlight => ({
  ...data,
  images: data.galleryImages?.map((img: any, index: number) => ({
    id: img.id || `${data.id}-img-${index}`,
    url: img.url,
  })),
  municipalityName: data.municipality?.name,
  municipalitySlug: data.municipality?.slug,
});

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Busca destaques aleatórios para a tela de Exploração.
 * staleTime de 5 minutos: dados mudam com frequência moderada.
 */
export function useRandomHighlights() {
  return useQuery<Highlight[]>({
    queryKey: highlightKeys.random(),
    queryFn: async () => {
      const data = await api.get<any[]>("/highlights/random");
      return data.map(formatHighlight);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Busca os dados completos de um destaque específico pelo ID.
 * Cache de 10 minutos.
 */
export function useHighlight(id: string) {
  return useQuery<Highlight>({
    queryKey: highlightKeys.detail(id),
    queryFn: async () => {
      const data = await api.get<any>(`/highlights/${id}`);
      return formatHighlight(data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
