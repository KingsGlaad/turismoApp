import TabBarBackground from "@/components/ui/TabBarBackground";
import { HapticTab } from "@/components/utils/HapticTab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Efeito para solicitar a permissão de localização ao iniciar o app
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Opcional: Você pode mostrar um alerta aqui informando ao usuário
        // que a permissão é necessária para algumas funcionalidades.
        console.log("Permissão de localização negada.");
      }
    };
    requestLocationPermission();
  }, []); // O array vazio garante que isso rode apenas uma vez.

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name={"home"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracks/index"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
