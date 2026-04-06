import { HighlightDetail } from "@/components/municipio/HighlightDetail";
import { QueryResult } from "@/components/utils/QueryResult";
import { useHighlight } from "@/hooks/useMunicipalities";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function HighlightDetailsPage() {
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

  return (
    <QueryResult
      loading={loading && !refreshing}
      error={error}
      data={highlight}
      errorMessage="Erro ao carregar o destaque."
    >
      {highlight && (
        <>
          <Stack.Screen options={{ title: highlight.title }} />
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <HighlightDetail highlight={highlight} />
          </ScrollView>
        </>
      )}
    </QueryResult>
  );
}
