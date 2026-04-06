import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { Post } from "@/types/Municipios";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { RenderHtml } from "../utils/RenderHtml";
import { MaterialIcons } from "@expo/vector-icons";

interface PostDetailProps {
  post: Post;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export function PostDetail({ post }: PostDetailProps) {
  const { width } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      {post.image ? (
        <Image source={{ uri: post.image }} style={[styles.headerImage, { width }]} />
      ) : (
        <View style={[styles.headerImage, styles.placeholderImage, { width }]}>
          <ThemedText>Sem imagem</ThemedText>
        </View>
      )}

      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {post.title}
        </ThemedText>

        <View style={styles.metaContainer}>
          <MaterialIcons name="event" size={16} color="#6b7280" />
          <ThemedText style={styles.dateText}>
            {formatDate(post.date)}
          </ThemedText>
        </View>

        {post.description && !post.content && (
          <ThemedText style={styles.description}>
            {post.description}
          </ThemedText>
        )}

        {(post.content || post.description) && (
          <RenderHtml source={post.content || post.description} />
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    height: 250,
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    flex: 1,
  },
  title: {
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  dateText: {
    color: "#6b7280",
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: "#4b5563",
  },
});
