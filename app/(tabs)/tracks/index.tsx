import * as Location from "expo-location";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import {
  useMunicipalities,
  useRandomHighlights,
} from "@/hooks/useMunicipalities";
import {
  Highlight,
  Image as HighlightImage,
  MunicipalityListItem,
} from "@/types/Cities";

// --- Função para calcular distância (Fórmula de Haversine) ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}

const { width: screenWidth } = Dimensions.get("window");

export default function ExploreScreen() {
  const { top } = useSafeAreaInsets();
  const { municipalities, loading: loadingMunicipalities } =
    useMunicipalities();
  const {
    highlights: randomHighlights,
    loading: loadingHighlights,
    error: errorHighlights,
    refetch: refetchHighlights,
  } = useRandomHighlights();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyMunicipalities, setNearbyMunicipalities] = useState<
    (MunicipalityListItem & { distance: number })[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Busca novos destaques aleatórios
    await refetchHighlights();
    setRefreshing(false);
  }, [refetchHighlights]);

  const handleLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg(
        "Permissão para acessar a localização foi negada. Ative nas configurações do seu dispositivo."
      );
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  useEffect(() => {
    handleLocationPermission();
  }, []);

  useEffect(() => {
    if (location && municipalities.length > 0) {
      const sorted = municipalities
        .map((city) => {
          const distance = getDistance(
            location.coords.latitude,
            location.coords.longitude,
            city.latitude,
            city.longitude
          );
          return { ...city, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // Pega os 10 mais próximos

      setNearbyMunicipalities(sorted);
    }
  }, [location, municipalities]);

  const renderNearbyCity = ({
    item,
  }: {
    item: MunicipalityListItem & { distance: number };
  }) => (
    <Link href={`/cities/${item.slug}`} asChild>
      <TouchableOpacity>
        <ImageBackground
          source={{ uri: item.coatOfArms }}
          style={styles.horizontalCard}
          imageStyle={{ borderRadius: 12 }}
        >
          <View style={styles.cardOverlay}>
            <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
            <ThemedText style={styles.distanceText}>{`${item.distance.toFixed(
              1
            )} km`}</ThemedText>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Link>
  );

  // Componente extraído para gerenciar o estado do slider individualmente
  const HighlightCard = ({ item }: { item: Highlight }) => {
    const flatListRef = useRef<FlatList<HighlightImage>>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Efeito para rolagem automática do carrossel
    useEffect(() => {
      if (!item.images || item.images.length <= 1) return;

      const interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % item.images.length;
        flatListRef.current?.scrollToIndex({
          animated: true,
          index: nextIndex,
        });
        setActiveIndex(nextIndex);
      }, 3000); // Muda a cada 3 segundos

      return () => clearInterval(interval); // Limpa o intervalo ao desmontar
    }, [activeIndex, item.images]);

    const handleScrollBegin = () => {
      // Poderíamos pausar o intervalo aqui se quiséssemos
    };

    const handleScrollEnd = () => {
      // E reiniciar o intervalo aqui
    };

    const onViewableItemsChanged = useRef(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
          setActiveIndex(viewableItems[0].index ?? 0);
        }
      }
    ).current;

    const renderCarouselItem = ({ item: image }: { item: HighlightImage }) => (
      <Link href={{ pathname: "/highligts", params: { id: item.id } }} asChild>
        <TouchableOpacity activeOpacity={0.9}>
          <View style={styles.carouselItemContainer}>
            <Image source={{ uri: image.url }} style={styles.highlightImage} />
          </View>
        </TouchableOpacity>
      </Link>
    );

    return (
      <View style={styles.highlightCard}>
        {/* Image Slider */}
        <View>
          {item.images && item.images.length > 0 ? (
            <View style={styles.carouselWrapper}>
              <FlatList
                ref={flatListRef}
                data={item.images}
                renderItem={renderCarouselItem}
                keyExtractor={(img) => `${item.id}-${img.id}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                onScrollBeginDrag={handleScrollBegin}
                onScrollEndDrag={handleScrollEnd}
              />
              {item.images.length > 1 && (
                <View style={styles.paginationContainer}>
                  {item.images.map((_, index) => (
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
          ) : (
            <View style={[styles.carouselWrapper, styles.placeholderImage]} />
          )}
        </View>

        <Link href={{ pathname: "/highligts", params: { id: item.id } }} asChild>
          <TouchableOpacity>
            <View style={styles.highlightContent}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={styles.highlightDescription}>
                {item.description}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Seção do Mapa */}
        <View style={styles.mapSection}>
          {errorMsg ? (
            <View style={styles.mapErrorContainer}>
              <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            </View>
          ) : !location ? (
            <View style={styles.mapErrorContainer}>
              <ActivityIndicator />
              <ThemedText style={{ marginTop: 8 }}>
                Obtendo localização...
              </ThemedText>
            </View>
          ) : (
            <MapView
              style={styles.map}
              mapType="satellite"
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              showsUserLocation
              showsMyLocationButton={false}
            >
              <Marker coordinate={location.coords} title="Sua Localização" />
            </MapView>
          )}
        </View>

        <View style={styles.content}>
          {/* Seção de Municípios Próximos */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Perto de você</ThemedText>
            {loadingMunicipalities && !nearbyMunicipalities.length ? (
              <ActivityIndicator style={{ marginTop: 10 }} />
            ) : (
              <FlatList
                data={nearbyMunicipalities}
                renderItem={renderNearbyCity}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </ThemedView>

          {/* Seção de Destaques Aleatórios */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Descubra</ThemedText>
            {errorHighlights ? (
              <ThemedText style={styles.errorText}>
                {errorHighlights}
              </ThemedText>
            ) : loadingHighlights ? (
              <ActivityIndicator style={{ marginTop: 10 }} />
            ) : (
              <FlatList
                scrollEnabled={false} // A rolagem principal é do ScrollView
                data={randomHighlights}
                renderItem={({ item }) => <HighlightCard item={item} />}
                keyExtractor={(item) => item.id}
              />
            )}
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  listContent: {
    paddingTop: 10,
  },
  horizontalCard: {
    width: 180,
    height: 100,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "space-between",
    overflow: "hidden", // Garante que a imagem respeite o borderRadius
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cardSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    alignSelf: "flex-start",
  },
  distanceText: {
    fontSize: 14,
    color: "#FFFFFF",
    alignSelf: "flex-end",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 10,
    color: "#EF4444",
  },
  mapSection: {
    height: 200,
  },
  mapErrorContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // --- Highlight Card Styles ---
  highlightCard: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    overflow: "hidden",
  },
  carouselWrapper: {
    height: 200,
  },
  carouselItemContainer: {
    width: screenWidth - 32, // screen width - (paddingHorizontal * 2)
    height: 200,
  },
  highlightImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
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
  },
  highlightContent: {
    padding: 16,
  },
  highlightDescription: {
    marginTop: 8,
    color: "#6b7280",
  },
});
