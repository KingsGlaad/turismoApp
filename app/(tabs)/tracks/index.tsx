import * as Location from "expo-location";
import { Link, router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { CachedImage } from "@/components/ui/CachedImage";
import { CarouselPagination } from "@/components/ui/CarouselPagination";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { useCities } from "@/hooks/queries/useCities";
import { useRandomHighlights } from "@/hooks/queries/useHighlights";
import {
  Highlight,
  Image as HighlightImage,
  MunicipalityListItem,
} from "@/types/Municipios";
import { styles } from "./_style";

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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ExploreScreen() {
  const { top } = useSafeAreaInsets();

  const { data: municipalities = [], isLoading: loadingMunicipalities } =
    useCities();
  const {
    data: randomHighlights = [],
    isLoading: loadingHighlights,
    error: errorHighlights,
    refetch: refetchHighlights,
  } = useRandomHighlights();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyMunicipalities, setNearbyMunicipalities] = useState<
    (MunicipalityListItem & { distance: number })[]
  >([]);

  const handleEnableLocation = useCallback(async () => {
    setLocationError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError(
        "Permissão de localização negada. Ative nas configurações do dispositivo para ver locais próximos.",
      );
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    setLocation(current);
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchHighlights();
    setRefreshing(false);
  }, [refetchHighlights]);

  useEffect(() => {
    if (!location || municipalities.length === 0) return;
    const sorted = municipalities
      .map((city) => ({
        ...city,
        distance: getDistance(
          location.coords.latitude,
          location.coords.longitude,
          city.latitude,
          city.longitude,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
    setNearbyMunicipalities(sorted);
  }, [location, municipalities]);

  const renderNearbyCity = ({
    item,
  }: {
    item: MunicipalityListItem & { distance: number };
  }) => (
    <Link
      href={{ pathname: "/cities/[slug]", params: { slug: item.slug } }}
      asChild
    >
      <TouchableOpacity>
        <ImageBackground
          source={{ uri: item.coatOfArms }}
          style={styles.horizontalCard}
          imageStyle={{ borderRadius: 12 }}
        >
          <View style={styles.cardOverlay}>
            <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
            <ThemedText style={styles.distanceText}>
              {`${item.distance.toFixed(1)} km`}
            </ThemedText>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Link>
  );

  const HighlightCard = ({ item }: { item: Highlight }) => {
    const flatListRef = useRef<FlatList<HighlightImage>>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewerVisible, setViewerVisible] = useState(false);

    useEffect(() => {
      if (!item.images || item.images.length <= 1) return;
      const interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % item.images.length;
        flatListRef.current?.scrollToIndex({
          animated: true,
          index: nextIndex,
        });
        setActiveIndex(nextIndex);
      }, 3000);
      return () => clearInterval(interval);
    }, [activeIndex, item.images]);

    const onViewableItemsChanged = useRef(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0)
          setActiveIndex(viewableItems[0].index ?? 0);
      },
    ).current;

    return (
      <ThemedCard style={styles.highlightCard}>
        <ImageViewerModal
          images={item.images}
          visible={isViewerVisible}
          initialIndex={activeIndex}
          onClose={() => setViewerVisible(false)}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/highlights/[id]",
              params: { id: item.id },
            })
          }
        >
          {item.images && item.images.length > 0 ? (
            <View style={styles.carouselWrapper}>
              <FlatList
                ref={flatListRef}
                data={item.images}
                renderItem={({ item: image, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setViewerVisible(true)}
                    style={styles.carouselItemContainer}
                  >
                    <CachedImage
                      source={{ uri: image.url }}
                      style={styles.highlightImage}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(img) => `${item.id}-${img.id}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              />
              <CarouselPagination
                data={item.images}
                activeIndex={activeIndex}
              />
            </View>
          ) : (
            <View style={[styles.carouselWrapper, styles.placeholderImage]} />
          )}
        </TouchableOpacity>
        <Link
          href={{ pathname: "/highlights/[id]", params: { id: item.id } }}
          asChild
        >
          <TouchableOpacity>
            <View style={styles.highlightContent}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={styles.highlightDescription}>
                {item.description}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </Link>
      </ThemedCard>
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
          {locationError ? (
            <View style={styles.mapPlaceholder}>
              <ThemedText style={styles.errorText}>{locationError}</ThemedText>
            </View>
          ) : !location ? (
            <View style={styles.mapPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Descubra locais turísticos próximos a você
              </ThemedText>
              <TouchableOpacity
                style={styles.enableLocationButton}
                onPress={handleEnableLocation}
              >
                <ThemedText style={styles.enableLocationText}>
                  📍 Ativar Localização
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <MapView
              style={styles.map}
              mapType="satellite"
              region={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation
              showsMyLocationButton={false}
            >
              <Marker coordinate={location.coords} title="Sua Localização" />
            </MapView>
          )}
        </View>

        <View style={styles.content}>
          {/* Municípios próximos — só exibe quando a localização está ativa */}
          {nearbyMunicipalities.length > 0 && (
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
          )}

          {/* Seção de Destaques Aleatórios */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Descubra</ThemedText>
            {errorHighlights ? (
              <ThemedText style={styles.errorText}>
                {errorHighlights.message}
              </ThemedText>
            ) : loadingHighlights ? (
              <ActivityIndicator style={{ marginTop: 10 }} />
            ) : (
              <FlatList
                scrollEnabled={false}
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
