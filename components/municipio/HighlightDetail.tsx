import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { RenderHtml } from "@/components/utils/RenderHtml";
import { Highlight, Image as HighlightImage } from "@/types/Cities";

interface HighlightDetailProps {
  highlight: Highlight;
}

const { width: screenWidth } = Dimensions.get("window");

export function HighlightDetail({ highlight }: HighlightDetailProps) {
  const flatListRef = useRef<FlatList<HighlightImage>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
    }
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

  const renderCarouselItem = ({ item }: { item: HighlightImage }) => (
    <View style={styles.carouselItemContainer}>
      <Image source={{ uri: item.url }} style={styles.headerImage} />
    </View>
  );

  return (
    <ScrollView>
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
          {highlight.images.length > 1 && (
            <View style={styles.paginationContainer}>
              {highlight.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
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

        {/* Descrição */}
        <ThemedText style={styles.description}>{highlight.description}</ThemedText>

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
        {highlight.description && (
          <ThemedView style={[styles.section, styles.aboutSection]}>
            <ThemedText type="subtitle">Sobre o local</ThemedText>
            <RenderHtml source={highlight.description} />
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: { height: 250, backgroundColor: "#eee" }, 
  carouselItemContainer: { width: screenWidth, height: 250 },
  headerImage: { width: "100%", height: "100%" },
  paginationContainer: { flexDirection: "row", position: "absolute", bottom: 15, alignSelf: "center" },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255, 255, 255, 0.6)", marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: "#FFFFFF" },
  contentContainer: { padding: 16 },
  titleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { flex: 1 },
  directionsButton: { backgroundColor: "#2f6fb3ff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  directionsButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  description: { fontSize: 16, marginVertical: 16, lineHeight: 24 },
  map: { height: 250, borderRadius: 12, marginVertical: 16 },
  section: { marginBottom: 16 },
  aboutSection: { backgroundColor: "rgba(128, 128, 128, 0.1)", padding: 16, borderRadius: 12, marginTop: 16 },
});