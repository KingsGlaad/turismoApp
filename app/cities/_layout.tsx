import { Stack } from "expo-router";

export default function CitiesLayout() {
  return (
    <Stack>
      <Stack.Screen name="[slug]" />
      <Stack.Screen name="highlights" />
    </Stack>
  );
}
