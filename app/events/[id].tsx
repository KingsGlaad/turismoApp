import { EventDetail } from "@/components/municipio/EventDetail";
import { QueryResult } from "@/components/utils/QueryResult";
import { useEvent } from "@/hooks/useMunicipalities";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function EventDetailsPage() {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id || "";

  const { event, loading, error, refetch } = useEvent(eventId);
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
      data={event}
      errorMessage="Erro ao carregar o evento."
    >
      {event && (
        <>
          <Stack.Screen options={{ title: event.title }} />
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <EventDetail event={event} />
          </ScrollView>
        </>
      )}
    </QueryResult>
  );
}
