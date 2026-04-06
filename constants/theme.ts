import { Platform } from "react-native";

// ─── Paleta de cores da marca ────────────────────────────────────────────────

export const Brand = {
  /** Azul — cor primária da ADETUR */
  primary: "#0002FF",
  /** Tons mais claros do primário */
  primaryLight: "#4D4FFF",
  primaryLighter: "#999AFF",

  /** Amarelo — cor secundária / destaque */
  secondary: "#FFB900",
  /** Tons mais claros do secundário */
  secondaryLight: "#FFCD4D",
  secondaryLighter: "#FFE199",

  /** Verde — cor terciária / sucesso */
  tertiary: "#00C950",
  /** Tons mais claros do terciário */
  tertiaryLight: "#4DDA84",
  tertiaryLighter: "#99EAB9",
} as const;

// ─── Cores temáticas ─────────────────────────────────────────────────────────

export const Colors = {
  light: {
    text: "#11181C",
    textMuted: "#6B7280",
    textInverted: "#FFFFFF",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#E5E7EB",
    tint: Brand.primary,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: Brand.primary,
    danger: "#DC2626",
    success: Brand.tertiary,
    warning: Brand.secondary,
    overlay: "rgba(0, 0, 0, 0.4)",
    skeleton: "#E5E7EB",
  },
  dark: {
    text: "#ECEDEE",
    textMuted: "#D1D5DB",
    textInverted: "#FFFFFF",
    background: "#000000",
    surface: "#1C1C1E",
    surfaceElevated: "#2C2C2E",
    border: "#2C2E2F",
    tint: Brand.primaryLight,
    icon: "#D1D5DB",
    tabIconDefault: "#D1D5DB",
    tabIconSelected: Brand.primaryLight,
    danger: "#F87171",
    success: Brand.tertiaryLight,
    warning: Brand.secondaryLight,
    overlay: "rgba(0, 0, 0, 0.6)",
    skeleton: "#1A1A1A",
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];

// ─── Espaçamento ─────────────────────────────────────────────────────────────

export const Spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md12: 12,
  /** 16px */
  md: 16,
  /** 20px */
  lg20: 20,
  /** 24px */
  lg: 24,
  /** 32px */
  xl: 32,
  /** 48px */
  xxl: 48,
} as const;

// ─── Raios de borda ───────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Sombras ──────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Tipografia ───────────────────────────────────────────────────────────────

export const Typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: "700" as const, lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: "600" as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: "600" as const, lineHeight: 18 },
} as const;

// ─── Fontes ───────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
