import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedText } from "@/components/theme/ThemedText";
import { QueryResult } from "@/components/utils/QueryResult";
import { usePosts } from "@/hooks/queries/usePosts";
import { Post } from "@/types/Municipios";
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PostCard = ({ item }: { item: Post }) => (
  <Link href={`/posts/${item.slug || item.id}` as any} asChild>
    <TouchableOpacity>
      <ThemedCard style={styles.card}>
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
          <ThemedText style={styles.cardDate}>
            {formatDate(item.date)}
          </ThemedText>
          <ThemedText style={styles.cardDescription} numberOfLines={3}>
            {item.subtitle}
          </ThemedText>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  </Link>
);

export default function PostsScreen() {
  const { top } = useSafeAreaInsets();
  const { data: posts = [], isLoading, error, refetch } = usePosts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <QueryResult
      loading={isLoading && !refreshing}
      error={error?.message ?? null}
      data={posts}
      loadingMessage="Carregando notícias..."
      errorMessage="Erro ao carregar as notícias."
      emptyMessage="Nenhuma notícia encontrada."
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.slug || item.id}
        renderItem={({ item }) => <PostCard item={item} />}
        contentContainerStyle={{ paddingTop: top, paddingHorizontal: 16 }}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.headerTitle}>
            Últimas Notícias
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
  headerTitle: {
    paddingVertical: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
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
