import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { useMunicipalities } from "@/hooks/useMunicipalities";
import { MunicipalityListItem } from "@/types/Cities";

interface MunicipalityListProps {
  searchQuery?: string;
}

export function MunicipalityList({ searchQuery = "" }: MunicipalityListProps) {
  const { municipalities, loading, error } = useMunicipalities(searchQuery);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
        <Image
          source={{ uri: item.coatOfArms }}
          style={styles.itemImage}
          resizeMode="cover"
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
    height: 150, // Altura de cada card
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // Adiciona um pequeno espaço entre os cards
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Ocupa todo o espaço do pai
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Sobreposição escura para contraste
  },
  itemName: {
    fontSize: 30,
    fontWeight: "600",
    color: "#FFFFFF", // Texto branco
    textAlign: "center",
    // Adiciona uma sombra sutil ao texto para melhor legibilidade
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textTransform: "uppercase",
  },
});
