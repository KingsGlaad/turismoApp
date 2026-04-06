import { EventDetail } from "@/components/municipio/EventDetail";
import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { useEvent, } from "@/hooks/useMunicipalities";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView } from "react-native";

export default function MunicipalityDetailsPage() {
  const { id } = useLocalSearchParams();

  // Garante que o slug é uma string antes de usar
  const eventId = typeof id === "string" ? id : "";
  const { event, loading, error, refetch } = useEvent(eventId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  console.log(event)

  if (loading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !event) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Erro ao carregar evento.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
     
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <EventDetail event={event} />
      </ScrollView>
    </>
  );
}
