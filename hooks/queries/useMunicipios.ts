import { api } from "@/lib/api";
import { Municipality, MunicipalityListItem } from "@/types/Municipios";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const cityKeys = {
  all: ["cities"] as const,
  list: () => [...cityKeys.all, "list"] as const,
  detail: (slug: string) => [...cityKeys.all, "detail", slug] as const,
  geojson: (ibgeCode: string) =>
    [...cityKeys.all, "geojson", ibgeCode] as const,
};

const formatMunicipality = (data: any): Municipality => ({
  ...data,
  highlights: data.highlights?.map((highlight: any) => ({
    ...highlight,
    images: highlight.galleryImages?.map((img: any, index: number) => ({
      id: img.id || `${highlight.id}-img-${index}`,
      url: img.url,
    })),
    galleryImages: undefined,
  })),
});

export function useCities() {
  return useQuery<MunicipalityListItem[]>({
    queryKey: cityKeys.list(),
    queryFn: () => api.get<MunicipalityListItem[]>("/cities"),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCitiesSearch(searchQuery: string) {
  const query = useCities();

  const filteredData = useMemo(() => {
    if (!query.data) return [];
    if (!searchQuery.trim()) return query.data;
    const q = searchQuery.toLowerCase();
    return query.data.filter((m) => m.name.toLowerCase().includes(q));
  }, [query.data, searchQuery]);

  return { ...query, data: filteredData };
}

export function useCity(slug: string) {
  return useQuery<Municipality>({
    queryKey: cityKeys.detail(slug),
    queryFn: async () => {
      const data = await api.get<any>(`/cities/${slug}`);
      return formatMunicipality(data);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCityGeoJson(ibgeCode?: string) {
  return useQuery<object>({
    queryKey: cityKeys.geojson(ibgeCode ?? ""),
    queryFn: () => api.get<object>(`/cities/geojson/${ibgeCode}`),
    enabled: !!ibgeCode,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
