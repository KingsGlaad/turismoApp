import { MunicipalityList } from "@/components/municipio/MunicipalityList";
import { ThemedView } from "@/components/theme/ThemedView";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useCitiesSearch } from "@/hooks/queries/useCities";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { Image, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const { top } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  const {
    data: municipalities = [],
    isLoading,
    error,
  } = useCitiesSearch(searchQuery);

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <ThemedView style={styles.header}>
        <Image
          source={require("@/assets/images/logo-adetur2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText
          style={{ color: themeColors.text, marginBottom: 16, marginTop: -15 }}
        >
          Circuito Mogiana
        </ThemedText>
        <ThemedView
          style={[styles.searchContainer, { borderColor: themeColors.icon }]}
        >
          <MaterialIcons name="search" size={20} color={themeColors.icon} />
          <TextInput
            placeholder="Pesquisar município..."
            style={[styles.searchInput, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={themeColors.icon}
          />
        </ThemedView>
      </ThemedView>
      <MunicipalityList
        municipalities={municipalities}
        loading={isLoading}
        error={error?.message ?? null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "center",
  },
  logo: {
    width: 128,
    height: 100,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
});
