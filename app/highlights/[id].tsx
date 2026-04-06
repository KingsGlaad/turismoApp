import { HighlightDetail } from "@/components/municipio/HighlightDetail";
import { QueryResult } from "@/components/utils/QueryResult";
import { useHighlight } from "@/hooks/queries/useHighlights";
import { Stack, useLocalSearchParams } from "expo-router";
import { RefreshControl, ScrollView } from "react-native";

export default function HighlightDetailsPage() {
  const { id } = useLocalSearchParams();
  const highlightId = typeof id === "string" ? id : "";

  const { data: highlight, isLoading, error, refetch } = useHighlight(highlightId);

  return (
    <QueryResult
      loading={isLoading}
      error={error?.message ?? null}
      data={highlight}
      errorMessage="Erro ao carregar o destaque."
    >
      {highlight && (
        <>
          <Stack.Screen options={{ title: highlight.title }} />
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={() => refetch()} />
            }
          >
            <HighlightDetail highlight={highlight} />
          </ScrollView>
        </>
      )}
    </QueryResult>
  );
}
