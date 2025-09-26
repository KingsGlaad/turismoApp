import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

interface RenderHtmlProps {
  source: string;
}

export function RenderHtml({ source }: RenderHtmlProps) {
  const { width } = useWindowDimensions();
  const textColor = useThemeColor({}, "text");

  const tagsStyles = {
    body: {
      whiteSpace: "normal",
      color: textColor,
    },
    p: {
      lineHeight: 24,
      fontSize: 16,
    },
  };

  return (
    <RenderHTML
      contentWidth={width}
      source={{ html: source }}
      tagsStyles={tagsStyles}
    />
  );
}
