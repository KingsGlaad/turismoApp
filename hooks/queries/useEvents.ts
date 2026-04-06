import { api } from "@/lib/api";
import { Event } from "@/types/Municipios";
import { useQuery } from "@tanstack/react-query";

export const eventKeys = {
  all: ["events"] as const,
  list: () => [...eventKeys.all, "list"] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
};

const formatEvent = (data: any): Event => ({
  ...data,
  image: data.image || data.galleryImages?.[0]?.url || "",
  galleryImages: data.galleryImages?.map((img: any, index: number) => ({
    id: img.id || `${data.id}-img-${index}`,
    url: img.url,
  })),
});

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: eventKeys.list(),
    queryFn: async () => {
      const data = await api.get<any[]>("/events");
      return data.map(formatEvent);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const raw = await api.get<any>(`/events/${id}`);
      const data = Array.isArray(raw) ? raw[0] : raw;
      return formatEvent(data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
