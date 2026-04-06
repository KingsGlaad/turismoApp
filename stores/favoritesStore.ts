/**
 * Store de Favoritos — Zustand com persistência AsyncStorage.
 *
 * Permite que o usuário favorite municípios e destaques turísticos
 * de forma offline, com persistência entre sessões do app.
 *
 * Uso:
 *   const { isFavorite, toggle } = useFavoritesStore();
 *   toggle('municipality', city.id);
 *   isFavorite('municipality', city.id); // true | false
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteType = "municipality" | "highlight" | "event";

interface FavoritesStore {
  /** Mapa de tipo → conjunto de IDs favoritados */
  favorites: Record<FavoriteType, string[]>;
  /** Adiciona ou remove um item dos favoritos */
  toggle: (type: FavoriteType, id: string) => void;
  /** Verifica se um item está nos favoritos */
  isFavorite: (type: FavoriteType, id: string) => boolean;
  /** Retorna a lista de IDs favoritados para um tipo */
  getFavorites: (type: FavoriteType) => string[];
  /** Remove todos os favoritos (útil para logout / reset) */
  clearAll: () => void;
}

const initialFavorites: Record<FavoriteType, string[]> = {
  municipality: [],
  highlight: [],
  event: [],
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: initialFavorites,

      toggle: (type, id) =>
        set((state) => {
          const current = state.favorites[type];
          const updated = current.includes(id)
            ? current.filter((f) => f !== id)
            : [...current, id];
          return { favorites: { ...state.favorites, [type]: updated } };
        }),

      isFavorite: (type, id) => get().favorites[type].includes(id),

      getFavorites: (type) => get().favorites[type],

      clearAll: () => set({ favorites: initialFavorites }),
    }),
    {
      name: "adetur-favorites",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
