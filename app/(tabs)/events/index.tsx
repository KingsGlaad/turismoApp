import { ThemedText } from "@/components/theme/ThemedText";
import { QueryResult } from "@/components/utils/QueryResult";
import { Event, useEvents } from "@/hooks/useMunicipalities";
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Função para formatar a data
const formatDate = (dateString: string) => {
  // Verifica se a string da data é válida antes de formatar
  if (!dateString) return "";
  const date = new Date(dateString);
  // Verifica se a data criada é válida
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EventCard = ({ item }: { item: Event }) => (
  <Link href={`/events/${item.id}`} asChild>
    <TouchableOpacity style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Image
            source={require("../../../assets/commons/no-image.jpeg")}
            style={styles.cardImage}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText style={styles.cardDate}>{formatDate(item.date)}</ThemedText>
        <ThemedText style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>
      </View>
    </TouchableOpacity>
  </Link>
);

export default function EventsScreen() {
  const { top } = useSafeAreaInsets();
  const { events, loading, error, refetch } = useEvents();
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
      data={events}
      loadingMessage="Carregando eventos..."
      errorMessage="Erro ao carregar os eventos."
      emptyMessage="Nenhum evento encontrado."
    >
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard item={item} />}
        contentContainerStyle={{ paddingTop: top, paddingHorizontal: 16 }}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.headerTitle}>
            Próximos Eventos
          </ThemedText>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </QueryResult>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    paddingVertical: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  placeholderImage: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 16,
  },
  cardDate: {
    fontSize: 12,
    color: "#888",
    marginVertical: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
