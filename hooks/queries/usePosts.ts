import { api } from "@/lib/api";
import { Post } from "@/types/Municipios";
import { useQuery } from "@tanstack/react-query";

export const postKeys = {
  all: ["posts"] as const,
  list: () => [...postKeys.all, "list"] as const,
  detail: (slug: string) => [...postKeys.all, "detail", slug] as const,
};

const formatPost = (data: any): Post => ({
  ...data,
  image: data.image || data.coverImage || "",
  date: data.date || data.createdAt || new Date().toISOString(),
});

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: postKeys.list(),
    queryFn: async () => {
      const data = await api.get<any[]>("/posts");
      return data.map(formatPost);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function usePost(slug: string) {
  return useQuery<Post>({
    queryKey: postKeys.detail(slug),
    queryFn: async () => {
      const raw = await api.get<any>(`/post/${slug}`);
      const data = Array.isArray(raw) ? raw[0] : raw;
      return formatPost(data);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}
