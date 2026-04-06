import { Image, type ImageContentFit, type ImageProps } from "expo-image";
import React from "react";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

const DEFAULT_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface CachedImageProps extends Omit<ImageProps, "style"> {
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  blurhash?: string;
}

export function CachedImage({
  style,
  contentFit = "cover",
  blurhash = DEFAULT_BLURHASH,
  ...rest
}: CachedImageProps) {
  return (
    <Image
      {...rest}
      style={[styles.base, style]}
      contentFit={contentFit}
      placeholder={{ blurhash }}
      transition={300}
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#E5E7EB",
  },
});
