import React from "react";
import { StyleSheet, View } from "react-native";

interface CarouselPaginationProps {
  data: any[];
  activeIndex: number;
}

export function CarouselPagination({
  data,
  activeIndex,
}: CarouselPaginationProps) {
  if (data.length <= 1) {
    return null;
  }

  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            activeIndex === index && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: { flexDirection: "row", position: "absolute", bottom: 15, alignSelf: "center" },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255, 255, 255, 0.6)", marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: "#FFFFFF" },
});