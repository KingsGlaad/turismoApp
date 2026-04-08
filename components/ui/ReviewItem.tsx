import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ThemedCard } from "../theme/ThemedCard";
import { ThemedText } from "../theme/ThemedText";
import { formatShortDate } from "../utils/dateUtils";

interface ReviewItemProps {
  item: {
    id: string;
    author: string;
    rating: number;
    avatarUrl: string;
    comment: string;
    createdAt: string;
  };
  width?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export function ReviewItem({
  item,
  width = screenWidth * 0.7,
}: ReviewItemProps) {
  const renderStars = (rating: number) => (
    <View style={styles.starContainer}>
      {Array.from({ length: 5 }).map((_, index) => {
        if (rating >= index + 1) {
          return (
            <MaterialIcons key={index} name="star" size={14} color="#FFC107" />
          );
        }
        if (rating >= index + 0.5) {
          return (
            <MaterialIcons
              key={index}
              name="star-half"
              size={14}
              color="#FFC107"
            />
          );
        }
        return (
          <MaterialIcons
            key={index}
            name="star-border"
            size={14}
            color="#FFC107"
          />
        );
      })}
    </View>
  );

  return (
    <ThemedCard style={[styles.card, { width }]}>
      <View style={styles.header}>
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.author} numberOfLines={1}>
              {item.author}
            </ThemedText>
            {renderStars(item.rating)}
          </View>
          <ThemedText style={styles.dateText}>
            {formatShortDate(item.createdAt)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.comment} numberOfLines={4}>
        {item.comment}
      </ThemedText>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    gap: 12,
    minHeight: 140,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ccc",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 2,
  },
  author: {
    fontWeight: "bold",
    fontSize: 15,
  },
  starContainer: {
    flexDirection: "row",
  },
  dateText: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
