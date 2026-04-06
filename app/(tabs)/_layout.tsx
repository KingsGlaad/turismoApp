import TabBarBackground from "@/components/ui/TabBarBackground";
import { HapticTab } from "@/components/utils/HapticTab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

// A permissão de localização foi removida daqui.
// Ela agora é solicitada de forma contextual na tela "Explorar",
// apenas quando o usuário toca em "Ativar Localização".

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
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
      <Tabs.Screen
        name="events/index"
        options={{
          title: "Eventos",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="posts/index"
        options={{
          title: "Notícias",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="newspaper" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
