import { ThemedText } from "@/components/theme/ThemedText";
import { ThemedView } from "@/components/theme/ThemedView";
import { useCity } from "@/hooks/queries/useCities";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";
import { MunicipalityDetail } from "../../components/municipio/MunicipalityDetail";

export default function MunicipalityDetailsPage() {
  const { slug } = useLocalSearchParams();
  const municipalitySlug = typeof slug === "string" ? slug : "";

  const { data: municipality, isLoading, error } = useCity(municipalitySlug);

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !municipality) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Erro ao carregar município.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: municipality.name }} />
      <MunicipalityDetail municipality={municipality} />
    </>
  );
}
