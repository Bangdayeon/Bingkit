import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { CommunityHeader } from '@/features/community/components/Header';
import { CommunityFilter } from '@/features/community/components/Filter';
import { PostList } from '@/features/community/components/PostList';
import EditIcon from '@/assets/icons/ic_edit.svg';
import { CommunityPost, PostCategory } from '@/types/community';
import { fetchPosts, PAGE_SIZE } from '@/features/community/lib/community';

const FILTER_CATEGORIES: (PostCategory | null)[] = [null, 'bingo_board', 'bingo_achieve', 'free'];

export default function CommunityScreen() {
  const router = useRouter();
  const [filterIndex, setFilterIndex] = useState(0);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadingRef = useRef(false);

  const category = FILTER_CATEGORIES[filterIndex];

  const loadPosts = useCallback(
    async (pageNum: number, cat: PostCategory | null, reset: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      const fetched = await fetchPosts(pageNum, cat);

      setPosts((prev) => (reset ? fetched : [...prev, ...fetched]));
      setHasMore(fetched.length === PAGE_SIZE);

      setLoading(false);
      loadingRef.current = false;
    },
    [],
  );

  // 필터 변경 시 초기화 후 재조회
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPosts(0, category, true);
  }, [filterIndex]);

  // 화면 포커스 시 첫 페이지 재조회 (글 작성 후 돌아왔을 때 반영)
  useFocusEffect(
    useCallback(() => {
      setPage(0);
      setHasMore(true);
      loadPosts(0, category, true);
    }, [category]),
  );

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    const next = page + 1;
    setPage(next);
    loadPosts(next, category, false);
  }, [hasMore, page, category, loadPosts]);

  const handleRefresh = useCallback(async () => {
    if (loadingRef.current) return;
    setRefreshing(true);
    const fetched = await fetchPosts(0, category);
    setPosts(fetched);
    setPage(0);
    setHasMore(fetched.length === PAGE_SIZE);
    setRefreshing(false);
  }, [category]);

  const handleFilterSelect = useCallback((index: number) => {
    setFilterIndex(index);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <CommunityHeader />
      <CommunityFilter selectedIndex={filterIndex} onSelect={handleFilterSelect} color="blue" />
      <PostList
        posts={posts}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        isLoading={loading}
        isRefreshing={refreshing}
        filterIndex={filterIndex}
      />

      <Pressable
        onPress={() => router.push('/community/write')}
        className="absolute bottom-[104px] shadow-gray-100 right-5 w-14 h-14 rounded-full bg-sky-300 items-center justify-center"
      >
        <EditIcon width={32} height={32} color="#4C5252" /* gray-700 */ />
      </Pressable>
    </SafeAreaView>
  );
}
