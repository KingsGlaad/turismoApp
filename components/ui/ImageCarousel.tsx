import { CarouselPagination } from "@/components/ui/CarouselPagination";
import { Image as AppImage } from "@/types/Cities";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";

interface ImageCarouselProps {
  images: AppImage[];
  onImagePress: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export function ImageCarousel({
  images,
  onImagePress,
  autoPlay = false,
  autoPlayInterval = 4000,
}: ImageCarouselProps) {
  const flatListRef = useRef<FlatList<AppImage>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, images.length, autoPlay, autoPlayInterval]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: AppImage;
    index: number;
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onImagePress(index)}
      style={styles.carouselItemContainer}
    >
      <Image source={{ uri: item.url }} style={styles.headerImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderCarouselItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      <CarouselPagination data={images} activeIndex={activeIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: { height: 250 },
  carouselItemContainer: { width: screenWidth, height: 250 },
  headerImage: { width: "100%", height: "100%", backgroundColor: "#e0e0e0" },
});
