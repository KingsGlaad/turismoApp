import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SimpleImage {
  id: string;
  url: string;
}

interface ImageViewerModalProps {
  images: SimpleImage[];
  visible: boolean;
  initialIndex: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function ImageViewerModal({
  images,
  visible,
  initialIndex,
  onClose,
}: ImageViewerModalProps) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && flatListRef.current) {
      // Garante que a lista role para o índice inicial sem animação quando o modal abre
      setTimeout(() => flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false }), 0);
    }
  }, [visible, initialIndex]);

  const renderImage = ({ item }: { item: SimpleImage }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.url }} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View style={styles.modalContainer}>
        <TouchableOpacity style={[styles.closeButton, { top: insets.top + 10 }]} onPress={onClose}>
          <MaterialIcons name="close" size={32} color="white" />
        </TouchableOpacity>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.9)" },
  closeButton: { position: "absolute", right: 15, zIndex: 1 },
  imageContainer: { width: screenWidth, height: screenHeight, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%" },
});