import { Radius, Shadows } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { View, type ViewProps } from "react-native";

export type ThemedCardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  elevated?: boolean;
  withShadow?: boolean;
};

export function ThemedCard({
  style,
  lightColor,
  darkColor,
  elevated = false,
  withShadow = false,
  ...otherProps
}: ThemedCardProps) {
  // Respects lightColor / darkColor if provided, otherwise uses default "surface" / "surfaceElevated"
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    elevated ? "surfaceElevated" : "surface",
  );

  return (
    <View
      style={[
        { backgroundColor, borderRadius: Radius.md },
        withShadow && Shadows.sm,
        style,
      ]}
      {...otherProps}
    />
  );
}
