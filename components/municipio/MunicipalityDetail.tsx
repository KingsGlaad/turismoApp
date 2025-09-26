import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  View,
  Platform,
  ViewToken,
} from "react-native";
import MunicipioMap from "./MunicipioMap";
import {
  Highlight,
  Image as MunicipalityImage,
  Event,
  Municipality,
} from "@/types/Cities";
import { ThemedView } from "../theme/ThemedView";
import { ThemedText } from "../theme/ThemedText";
import MapView from "react-native-maps";
import { RenderHtml } from "../utils/RenderHtml";
import { MaterialIcons } from "@expo/vector-icons";

interface MunicipalityDetailProps {
  municipality: Municipality;
}

const { width: screenWidth } = Dimensions.get("window");

export function MunicipalityDetail({ municipality }: MunicipalityDetailProps) {
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList<MunicipalityImage>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Efeito para auto-rolagem do carrossel
  useEffect(() => {
    // Só ativa se houver mais de uma imagem
    if (!municipality.images || municipality.images.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % municipality.images.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // Muda a imagem a cada 4 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, [activeIndex, municipality.images]);

  const handleHighlightPress = (highlight: Highlight) => {
    mapRef.current?.animateToRegion(
      {
        latitude: highlight.latitude,
        longitude: highlight.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      // Usa o primeiro item visível para definir o índice ativo.
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const handleGetDirections = () => {
    const { latitude, longitude, name } = municipality;
    if (!latitude || !longitude) return;

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${latitude},${longitude}`;
    const label = name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url!);
  };
  const renderCarouselItem = ({ item }: { item: MunicipalityImage }) => {
    return (
      <ThemedView style={styles.carouselItemContainer}>
        <Image source={{ uri: item.url }} style={styles.headerImage} />
      </ThemedView>
    );
  };

  const renderHighlightItem = ({ item }: { item: Highlight }) => (
    <TouchableOpacity
      style={styles.highlightCard}
      onPress={() => handleHighlightPress(item)}
    >
      <ThemedText style={styles.highlightCardTitle}>{item.title}</ThemedText>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: Event }) => {
    const isExpanded = expandedEventId === item.id;
    const eventDate = new Date(item.date);
    const formattedDate = eventDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return (
      <View style={styles.eventContainer}>
        <TouchableOpacity
          style={styles.eventHeader}
          onPress={() => setExpandedEventId(isExpanded ? null : item.id)}
        >
          <ThemedText style={styles.eventTitle}>{item.title}</ThemedText>
          <MaterialIcons
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#6b7280"
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.eventContent}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.eventImage} />
            )}
            <ThemedText style={styles.eventDate}>{formattedDate}</ThemedText>
            <ThemedText>{item.description}</ThemedText>
          </View>
        )}
      </View>
    );
  };
  return (
    <ScrollView>
      {/* 1. Image Slider */}
      {municipality.images && municipality.images.length > 1 && (
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={municipality.images}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />
          <View style={styles.paginationContainer}>
            {municipality.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      <ThemedView style={styles.contentContainer}>
        {/* 2. Title and Description */}
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            {municipality.name}
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
        {municipality.description && (
          <ThemedText style={styles.description}>
            {municipality.description}
          </ThemedText>
        )}

        {/* 3. Map with Highlights and GeoJSON */}
        {municipality.latitude && municipality.longitude && (
          <MunicipioMap
            ref={mapRef}
            initialLatitude={municipality.latitude}
            initialLongitude={municipality.longitude}
            highlights={municipality.highlights || []}
            ibgeCode={municipality.ibgeCode}
          />
        )}

        {/* 4. Horizontal Highlights List */}
        {municipality.highlights && municipality.highlights.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Destaques</ThemedText>
            <FlatList
              data={municipality.highlights}
              renderItem={renderHighlightItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </ThemedView>
        )}

        {/* 5. "About" Section */}
        {municipality.about && (
          <ThemedView style={[styles.section, styles.aboutSection]}>
            <ThemedText type="subtitle">Sobre</ThemedText>
            <RenderHtml source={municipality.about} />
          </ThemedView>
        )}

        {/* 6. Events Accordion */}
        {municipality.events && municipality.events.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Eventos</ThemedText>
            <FlatList
              data={municipality.events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false} // Desativa a rolagem da lista interna
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    textAlign: "center",
  },
  carouselWrapper: {
    height: 250,
    marginBottom: 16,
  },
  carouselItemContainer: {
    width: screenWidth,
    height: 250,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  aboutSection: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  highlightCard: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  highlightCardTitle: {
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    flex: 1, // Garante que o título não empurre o botão para fora da tela
  },
  directionsButton: {
    backgroundColor: "#007AFF", // Um azul padrão, pode ser ajustado com suas cores de tema
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  directionsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  eventContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
    paddingVertical: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  eventContent: {
    marginTop: 12,
  },
  eventImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 8,
  },
});
