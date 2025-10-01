import { HighlightDetail } from "@/components/municipio/HighlightDetail";
import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { useHighlight } from "@/hooks/useMunicipalities";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView } from "react-native";

export default function MunicipalityDetailsPage() {
  const { id } = useLocalSearchParams();

  // Garante que o slug é uma string antes de usar
  const highlightId = typeof id === "string" ? id : "";
  const { highlight, loading, error, refetch } = useHighlight(highlightId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  if (error || !highlight) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Erro ao carregar município.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: highlight.title }} />
      {/* Envolvemos o HighlightDetail com um ScrollView para usar o RefreshControl */}
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <HighlightDetail highlight={highlight} />
      </ScrollView>
    </>
  );
}
