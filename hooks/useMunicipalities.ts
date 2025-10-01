import {
  Highlight,
  Municipality,
  MunicipalityListItem,
} from "@/types/Cities";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://192.168.0.5:3000/api";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useMunicipalities(searchQuery: string = "") {
  // Estado para armazenar a lista completa de municípios, sem filtro.
  const [allMunicipalities, setAllMunicipalities] = useState<
    MunicipalityListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Esta função agora busca todos os municípios apenas uma vez.
    const loadMunicipalities = async () => {
      try {
        // Só busca se a lista ainda não foi carregada
        setLoading(true);
        const url = new URL(`${API_URL}/cities`);
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Falha na resposta da rede: ${response.statusText}`);
        }
        const data = await response.json();
        setAllMunicipalities(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar municípios"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMunicipalities();
  }, []);

  // Filtra a lista de municípios no lado do cliente.
  // `useMemo` otimiza o processo, refazendo o filtro apenas se a lista ou a busca mudarem.
  const filteredMunicipalities = useMemo(() => {
    if (!searchQuery) {
      return allMunicipalities;
    }
    return allMunicipalities.filter((municipality) =>
      municipality.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMunicipalities, searchQuery]);

  return { municipalities: filteredMunicipalities, loading, error };
}

export function useMunicipality(slug: string) {
  const [municipality, setMunicipality] = useState<Municipality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false); // Se não houver ID, para o carregamento
      return;
    }

    const loadMunicipality = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/cities/${slug}`);
        if (!response.ok) {
          throw new Error(`Falha na resposta da rede: ${response.statusText}`);
        }
        const data = await response.json();
        setMunicipality(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar município"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMunicipality();
  }, [slug]); // Re-executa o efeito quando o slug muda

  return { municipality, loading, error };
}

/**
 * Hook para buscar os dados de GeoJSON de um município específico.
 * @param ibgeCode O código IBGE do município.
 */
export function useMunicipalityGeoJson(ibgeCode?: string) {
  const [geojson, setGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ibgeCode) {
      setGeojson(null);
      return;
    }

    const loadGeoJson = async () => {
      try {
        setLoading(true);
        // Assumindo que sua API tem um endpoint para GeoJSON baseado no código IBGE
        const response = await fetch(`${API_URL}/cities/geojson/${ibgeCode}`);
        if (!response.ok) {
          throw new Error("GeoJSON não encontrado para este município.");
        }
        const data = await response.json();
        setGeojson(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar GeoJSON"
        );
      } finally {
        setLoading(false);
      }
    };

    loadGeoJson();
  }, [ibgeCode]);

  return { geojson, loading, error };
}

/**
 * Hook para buscar destaques (pontos turísticos) de forma aleatória.
 */
export function useRandomHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRandomHighlights = useCallback(async () => {
    try {
      setLoading(true);
      // Assumindo que sua API tem um endpoint para destaques aleatórios
      const response = await fetch(`${API_URL}/highlights/random`);
      if (!response.ok) {
        throw new Error(`Falha na resposta da rede: ${response.statusText}`);
      }
      const data = await response.json();

      // Mapeia a resposta da API para a estrutura que o app espera
      const formattedData = data.map((highlight: any) => ({
        id: highlight.id,
        title: highlight.title,
        description: highlight.description,
        // A API retorna 'galleryImages', o app espera 'images'
        // E cada imagem precisa de um 'id' para o keyExtractor
        images: highlight.galleryImages.map((img: any, index: number) => ({
          id: `${highlight.id}-img-${index}`, // Cria um ID único para a chave
          url: img.url,
        })),
        municipalityName: highlight.municipality.name,
        municipalitySlug: highlight.municipality.slug,
      }));
      setHighlights(formattedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar destaques"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRandomHighlights();
  }, []);

  return { highlights, loading, error, refetch: loadRandomHighlights };
}

/**
 * Hook para buscar os dados de um destaque (ponto turístico) específico.
 * @param id O ID do destaque.
 */
export function useHighlight(id: string) {
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHighlight = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/highlights/${id}`);
      if (!response.ok) {
        throw new Error(`Falha na resposta da rede: ${response.statusText}`);
      }
      const data = await response.json();
      // Formata os dados para garantir consistência com a lista de destaques
      const formattedData = {
        id: data.id,
        title: data.title,
        description: data.description,
        images: data.galleryImages.map((img: any, index: number) => ({
          id: `${data.id}-img-${index}`,
          url: img.url,
        })),
        ...data, // Inclui o resto dos campos que possam existir
      };
      setHighlight(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar destaque");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHighlight();
  }, [id]);

  return { highlight, loading, error, refetch: loadHighlight };
}
