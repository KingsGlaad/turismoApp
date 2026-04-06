import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, marginTop: 16 },
  section: { marginBottom: 24 },
  listContent: { paddingTop: 10 },
  // ── Mapa ────────────────────────────────────────────────────────────────────
  mapSection: { height: 220 },
  map: { ...StyleSheet.absoluteFillObject },
  mapPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26, 107, 71, 0.08)",
    gap: 12,
    paddingHorizontal: 24,
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 15,
    opacity: 0.7,
  },
  enableLocationButton: {
    backgroundColor: "#1A6B47",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  enableLocationText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  // ── Cards de municípios próximos ─────────────────────────────────────────────
  horizontalCard: {
    width: 180,
    height: 100,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  distanceText: {
    fontSize: 14,
    color: "#FFFFFF",
    alignSelf: "flex-end",
    fontWeight: "500",
  },
  errorText: { marginTop: 10, color: "#EF4444" },
  // ── Cards de destaques ───────────────────────────────────────────────────────
  highlightCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  carouselWrapper: { height: 200 },
  carouselItemContainer: { width: screenWidth - 32, height: 200 },
  highlightImage: { width: "100%", height: "100%" },
  placeholderImage: { backgroundColor: "rgba(128,128,128,0.2)" },
  highlightContent: { padding: 16 },
  highlightDescription: { marginTop: 8, color: "#6b7280" },
});
