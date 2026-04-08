import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { fakeReviews } from "@/constants/data";
import { Image as CityImage, Event } from "@/types/Municipios";
import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { formatDate } from "../utils/dateUtils";
import { RenderHtml } from "../utils/RenderHtml";
import { ReviewItem } from "../ui/ReviewItem";

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [isViewerVisible, setViewerVisible] = useState(false);

  // --- Dados Fictícios para Avaliações ---
  // Gera uma nota e número de avaliações "únicos" para cada evento
  const ratingValue =
    Math.round(((event.id.charCodeAt(0) % 11) / 10 + 4.0) * 10) / 10; // Nota entre 4.0 e 5.0
  const reviewCount = (event.id.charCodeAt(1) % 50) + 15; // Entre 15 e 64 avaliações

  // Unifica as imagens para o carrossel e o visualizador
  const images = useMemo<CityImage[]>(() => {
    if (event.galleryImages && event.galleryImages.length > 0) {
      return event.galleryImages.map((img, index) => ({
        id: (img as any).id ?? `${event.id}-img-${index}`,
        url: (img as any).url,
        municipalityId: event.municipality?.id ?? null,
        createdAt: (img as any).createdAt ?? new Date().toISOString(),
        updatedAt: (img as any).updatedAt ?? new Date().toISOString(),
      }));
    }
    if (event.image) {
      return [
        {
          id: `${event.id}-img-0`,
          url: event.image,
          municipalityId: event.municipality?.id ?? null,
          createdAt: event.date ? String(event.date) : new Date().toISOString(),
          updatedAt: event.date ? String(event.date) : new Date().toISOString(),
        },
      ];
    }
    return [];
  }, [
    event.galleryImages,
    event.image,
    event.id,
    event.municipality?.id,
    event.date,
  ]);

  const handleImagePress = (index: number) => {
    setViewerInitialIndex(index);
    setViewerVisible(true);
  };


  const { width: screenWidth } = Dimensions.get("window");

  // Função para renderizar o card de avaliação na FlatList
  const renderReviewItem = ({ item }: { item: (typeof fakeReviews)[0] }) => (
    <ReviewItem item={item} width={screenWidth * 0.7} />
  );


  return (
    <>
      <ImageViewerModal
        images={images}
        visible={isViewerVisible}
        initialIndex={viewerInitialIndex}
        onClose={() => setViewerVisible(false)}
      />
      <View style={styles.container}>
        {images.length > 0 ? (
          <ImageCarousel images={images} onImagePress={handleImagePress} />
        ) : (
          <View style={[styles.carouselWrapper, styles.placeholderImage]}>
            <ThemedText>Sem imagem</ThemedText>
          </View>
        )}

        <ThemedView style={styles.content}>
          <ThemedCard style={styles.dateContainer}>
            <View style={styles.dateInfo}>
              <MaterialIcons name="event" size={16} color="#6b7280" />
              <ThemedText style={styles.dateText}>
                {formatDate(event.date)}
              </ThemedText>
            </View>
            {event.municipality?.name && (
              <ThemedText style={styles.municipalityText}>
                em{" "}
                <Link href={`/cities/${event.municipality.slug}`}>
                  {event.municipality.name}
                </Link>
              </ThemedText>
            )}
          </ThemedCard>
          {event.description && <RenderHtml source={event.description} />}

          {/* Seção de Avaliações */}
          <ThemedView style={styles.section}>
            <View style={styles.ratingSummaryContainer}>
              <View style={styles.starContainer}>
                {Array.from({ length: 5 }).map((_, index) => {
                  if (ratingValue >= index + 1) {
                    return <MaterialIcons key={index} name="star" size={16} color="#FFC107" />;
                  }
                  if (ratingValue >= index + 0.5) {
                    return <MaterialIcons key={index} name="star-half" size={16} color="#FFC107" />;
                  }
                  return <MaterialIcons key={index} name="star-border" size={16} color="#FFC107" />;
                })}
              </View>
              <ThemedText style={styles.ratingText}>
                {ratingValue.toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.reviewCountText}>
                ({reviewCount} avaliações)
              </ThemedText>
            </View>
            <ThemedText type="subtitle">O que as pessoas dizem</ThemedText>
            <FlatList
              data={fakeReviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </ThemedView>
        </ThemedView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselWrapper: {
    height: 250,
    backgroundColor: "#e0e0e0",
  },

  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  directionsButton: {
    backgroundColor: "#2f6fb3ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontWeight: "bold",
  },
  municipalityText: {
    color: "#6b7280",
    fontSize: 14,
  },
  directionsButtonText: {
    color: "#FFFFFF",
  },
  // --- Estilos para Avaliação e Comentários ---
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  ratingSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: "row",
  },
  ratingText: {
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  reviewCountText: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 14,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    gap: 12, // Adiciona espaço entre o header e o comentário
  },
  reviewUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  reviewAuthor: {
    fontWeight: "bold",
  },
  reviewComment: {
    lineHeight: 20,
  },
});
