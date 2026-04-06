import { CachedImage } from "@/components/ui/CachedImage";
import { MunicipalityListItem } from "@/types/Municipios";
import { Link } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MunicipalityListProps {
  /** Lista de municípios já filtrados e buscados pelo componente pai */
  municipalities: MunicipalityListItem[];
  loading?: boolean;
  error?: string | null;
}

export function MunicipalityList({
  municipalities,
  loading = false,
  error = null,
}: MunicipalityListProps) {
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1A6B47" />
        <Text style={styles.loadingText}>Carregando municípios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          Erro ao carregar municípios: {error}
        </Text>
      </View>
    );
  }

  const renderMunicipality = ({ item }: { item: MunicipalityListItem }) => (
    <Link href={`/cities/${item.slug}`} asChild>
      <TouchableOpacity style={styles.itemContainer}>
        <CachedImage
          source={{ uri: item.coatOfArms }}
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={municipalities}
        keyExtractor={(item) => item.id}
        renderItem={renderMunicipality}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
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
    color: "#4B5563",
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  itemName: {
    fontSize: 30,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textTransform: "uppercase",
  },
});
