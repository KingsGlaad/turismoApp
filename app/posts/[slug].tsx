import { PostDetail } from "@/components/posts/PostDetail";
import { QueryResult } from "@/components/utils/QueryResult";
import { usePost } from "@/hooks/queries/usePosts";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function PostDetailsPage() {
  const { slug } = useLocalSearchParams();
  const postSlug = Array.isArray(slug) ? slug[0] : slug || "";

  const { data: post, isLoading, error, refetch } = usePost(postSlug);

  return (
    <QueryResult
      loading={isLoading}
      error={error?.message ?? null}
      data={post}
      errorMessage="Erro ao carregar a notícia."
    >
      {post && (
        <>
          <Stack.Screen options={{ title: "Notícia" }} />
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={() => refetch()} />
            }
          >
            <PostDetail post={post} />
          </ScrollView>
        </>
      )}
    </QueryResult>
  );
}
