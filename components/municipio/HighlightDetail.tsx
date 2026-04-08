import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { CarouselPagination } from "@/components/ui/CarouselPagination";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { RenderHtml } from "@/components/utils/RenderHtml";
import { fakeReviews } from "@/constants/data";
import { Highlight } from "@/types/Municipios";
import { ReviewItem } from "../ui/ReviewItem";

interface HighlightDetailProps {
  highlight: Highlight;
}

const { width: screenWidth } = Dimensions.get("window");

export function HighlightDetail({ highlight }: HighlightDetailProps) {
  const flatListRef = useRef<FlatList<(typeof highlight.images)[0]>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // --- Dados Fictícios para Avaliações ---
  // Gera uma nota e número de avaliações "únicos" para cada destaque
  const ratingValue =
    Math.round(((highlight.id.charCodeAt(0) % 11) / 10 + 4.0) * 10) / 10; // Nota entre 4.0 e 5.0
  const reviewCount = (highlight.id.charCodeAt(1) % 50) + 15; // Entre 15 e 64 avaliações

  // Efeito para auto-rolagem do carrossel
  useEffect(() => {
    if (!highlight.images || highlight.images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % highlight.images.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // Muda a imagem a cada 4 segundos

    return () => clearInterval(interval);
  }, [activeIndex, highlight.images]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const handleGetDirections = () => {
    const { latitude, longitude, title } = highlight;
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${latitude},${longitude}`;
    const label = title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url!);
  };

  const renderCarouselItem = ({
    item,
  }: {
    item: (typeof highlight.images)[0];
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        setViewerInitialIndex(activeIndex);
        setViewerVisible(true);
      }}
    >
      <View style={styles.carouselItemContainer}>
        <Image source={{ uri: item.url }} style={styles.headerImage} />
      </View>
    </TouchableOpacity>
  );


  // Função para renderizar o card de avaliação na FlatList
  const renderReviewItem = ({ item }: { item: (typeof fakeReviews)[0] }) => (
    <ReviewItem item={item} width={screenWidth * 0.7} />
  );

  return (
    <>
      <ImageViewerModal
        images={highlight.images}
        visible={isViewerVisible}
        initialIndex={viewerInitialIndex}
        onClose={() => setViewerVisible(false)}
      />
      {/* Carrossel de Imagens */}
      {highlight.images && highlight.images.length > 0 && (
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={highlight.images}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />
          <CarouselPagination
            data={highlight.images}
            activeIndex={activeIndex}
          />
        </View>
      )}

      <ThemedView style={styles.contentContainer}>
        {/* Título e Botão "Como Chegar" */}
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            {highlight.title}
          </ThemedText>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <MaterialIcons name="directions" size={20} color="#fff" />
            <ThemedText style={styles.directionsButtonText}>
              Como chegar
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.ratingSummaryContainer}>
          <View style={styles.starContainer}>
            {Array.from({ length: 5 }).map((_, index) => {
              if (ratingValue >= index + 1) {
                return (
                  <MaterialIcons key={index} name="star" size={16} color="#FFC107" />
                );
              }
              if (ratingValue >= index + 0.5) {
                return (
                  <MaterialIcons
                    key={index}
                    name="star-half"
                    size={16}
                    color="#FFC107"
                  />
                );
              }
              return (
                <MaterialIcons
                  key={index}
                  name="star-border"
                  size={16}
                  color="#FFC107"
                />
              );
            })}
          </View>
          <ThemedText style={styles.ratingText}>
            {ratingValue.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.reviewCountText}>
            ({reviewCount} avaliações)
          </ThemedText>
        </View>

        {/* Descrição */}
        <ThemedText style={styles.description}>
          {highlight.description}
        </ThemedText>

        {/* Mapa */}
        <MapView
          style={styles.map}
          provider={"google"}
          mapType="satellite"
          // Usar 'region' em vez de 'initialRegion' para forçar o zoom correto.
          region={{
            latitude: highlight.latitude,
            longitude: highlight.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
        >
          <Marker
            coordinate={{
              latitude: highlight.latitude,
              longitude: highlight.longitude,
            }}
            title={highlight.title}
          />
        </MapView>

        {/* Conteúdo "Sobre" (se houver) */}
        {highlight.description && highlight.description.trim().length > 0 && (
          <ThemedCard style={[styles.section, styles.aboutSection]}>
            <ThemedText type="subtitle">Sobre o local</ThemedText>
            <RenderHtml source={highlight.description} />
          </ThemedCard>
        )}

        {/* Seção de Avaliações */}
        <ThemedView style={styles.section}>
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
    </>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: { height: 250, backgroundColor: "#eee" },
  carouselItemContainer: { width: screenWidth, height: 250 },
  headerImage: { width: "100%", height: "100%" },
  contentContainer: { padding: 16 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { flex: 1 },
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
  directionsButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  description: { fontSize: 16, marginVertical: 16, lineHeight: 24 },
  map: { height: 250, borderRadius: 12, marginVertical: 16 },
  section: { marginBottom: 16 },
  aboutSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  // --- Estilos para Avaliação e Comentários ---
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
  reviewContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.1)",
  },
  reviewCard: {
    width: screenWidth * 0.7,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    height: 150,
    justifyContent: "space-between",
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
    marginBottom: 4,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewComment: {
    color: "#FFF",
    lineHeight: 20,
  },
  reviewDate: {
    color: "#6b7280",
    fontSize: 12,
  },
  reviewUserInfoText: {
    flexDirection: "column",
    gap: 4,
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
});
