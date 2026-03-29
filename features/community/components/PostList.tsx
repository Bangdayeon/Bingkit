import { useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CommunityPost } from '@/types/community';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: CommunityPost[];
  onLoadMore: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  filterIndex: number;
}

const Separator = () => <View className="h-px bg-gray-300 dark:bg-gray-700" />;

export function PostList({
  posts,
  onLoadMore,
  onRefresh,
  isLoading,
  isRefreshing,
  filterIndex,
}: PostListProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList<CommunityPost>>(null);

  // 필터 변경 시 맨 위로 스크롤
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filterIndex]);

  const renderItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <Pressable onPress={() => router.push(`/community/${item.id}`)}>
        <PostCard post={item} />
      </Pressable>
    ),
    [router],
  );

  const keyExtractor = useCallback((item: CommunityPost) => item.id, []);

  return (
    <FlatList
      ref={flatListRef}
      data={posts}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#929898" />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
      ListFooterComponent={
        isLoading ? <ActivityIndicator className="py-4" color="#929898" /> : null
      }
      // ── 렌더링 최적화 ──────────────────────────────────────
      windowSize={5} // 현재 뷰포트 기준 ±2 뷰포트 범위만 렌더링
      initialNumToRender={10} // 초기 렌더 아이템 수
      maxToRenderPerBatch={8} // JS 프레임당 렌더 배치
      updateCellsBatchingPeriod={30}
      removeClippedSubviews // 화면 밖 아이템 네이티브 레이어에서 분리 (Android)
    />
  );
}
