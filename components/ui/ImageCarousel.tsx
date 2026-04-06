/**
 * ImageCarousel — Componente unificado de carrossel de imagens.
 *
 * Substitui as 3 implementações duplicadas que existiam em:
 * - app/(tabs)/tracks/index.tsx (HighlightCard)
 * - components/municipio/MunicipalityDetail.tsx
 * - components/municipio/HighlightDetail.tsx
 *
 * Usa CachedImage internamente para cache em disco automático.
 */
import { CachedImage } from "@/components/ui/CachedImage";
import { CarouselPagination } from "@/components/ui/CarouselPagination";
import { Image as AppImage } from "@/types/Municipios";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

interface ImageCarouselProps {
  images: AppImage[];
  /** Callback quando o usuário toca em uma imagem. Recebe o índice ativo. */
  onImagePress?: (index: number) => void;
  /** Altura do carrossel em pixels. Padrão: 250 */
  height?: number;
  /** Ativa rolagem automática entre imagens. Padrão: false */
  autoPlay?: boolean;
  /** Intervalo em ms para autoPlay. Padrão: 4000 */
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export function ImageCarousel({
  images,
  onImagePress,
  height = 250,
  autoPlay = false,
  autoPlayInterval = 4000,
}: ImageCarouselProps) {
  const flatListRef = useRef<FlatList<AppImage>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── AutoPlay ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, images.length, autoPlay, autoPlayInterval]);

  // ── Callback de visibilidade ─────────────────────────────────────────────────
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  // ── Render ──────────────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: AppImage; index: number }) => (
    <TouchableOpacity
      activeOpacity={onImagePress ? 0.9 : 1}
      onPress={() => onImagePress?.(index)}
      style={[styles.itemContainer, { width: screenWidth, height }]}
    >
      <CachedImage source={{ uri: item.url }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, { height }]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      {images.length > 1 && (
        <CarouselPagination data={images} activeIndex={activeIndex} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  itemContainer: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
