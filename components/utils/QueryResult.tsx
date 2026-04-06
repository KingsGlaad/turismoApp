import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { ThemedText } from "../theme/ThemedText";
import { ThemedView } from "../theme/ThemedView";

interface QueryResultProps<T> {
  loading: boolean;
  error: string | null;
  data: T | null | undefined | T[];
  children: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
}

export function QueryResult<T>({
  loading,
  error,
  data,
  children,
  loadingMessage = "Carregando...",
  errorMessage = "Ocorreu um erro ao carregar os dados.",
  emptyMessage = "Nenhum dado encontrado.",
}: QueryResultProps<T>) {
  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.messageText}>{loadingMessage}</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>{errorMessage}</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  const isEmpty = Array.isArray(data) ? data.length === 0 : !data;
  if (isEmpty) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>{emptyMessage}</ThemedText>
      </ThemedView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageText: { marginTop: 10 },
  errorText: { color: "red", marginTop: 4 },
});