import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import { supabase } from '@/lib/supabase';

interface EarnedBadge {
  badgeId: string;
  iconUrl: string;
  name: string;
  earnedAt: string; // ISO string, 정렬용
}

const TOTAL_BADGES = 16;

async function fetchMyBadges(): Promise<EarnedBadge[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at, badges ( name, icon_url )')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: true });

  return (data ?? []).map((row) => {
    const badgeRaw = row.badges as unknown;
    const badge = Array.isArray(badgeRaw)
      ? ((badgeRaw[0] as { name: string; icon_url: string | null } | undefined) ?? null)
      : (badgeRaw as { name: string; icon_url: string | null } | null);
    return {
      badgeId: row.badge_id as string,
      iconUrl: (badge?.icon_url as string | undefined) ?? '',
      name: (badge?.name as string | undefined) ?? '',
      earnedAt: row.earned_at as string,
    };
  });
}

export function BadgesPage() {
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBadges().then((data) => {
      setEarned(data);
      setLoading(false);
    });
  }, []);

  // 획득 순서대로 슬롯 채우기, 나머지는 빈 슬롯
  const slots: (EarnedBadge | null)[] = [
    ...earned,
    ...Array<null>(Math.max(0, TOTAL_BADGES - earned.length)).fill(null),
  ];

  return (
    <ScrollView className="flex-1 mt-[80px] bg-white dark:bg-gray-900 mb-20">
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color="#929898" /* gray-500 */ />
        </View>
      ) : (
        <View className="px-5 py-4">
          <View className="flex-row flex-wrap gap-3 justify-center">
            {slots.map((badge, i) =>
              badge ? (
                <Image
                  key={badge.badgeId}
                  source={{ uri: badge.iconUrl }}
                  style={{ width: 96, height: 96, borderRadius: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  key={`empty-${i}`}
                  className="bg-gray-200 dark:bg-gray-700 rounded-[20px]"
                  style={{ width: 96, height: 96 }}
                />
              ),
            )}
          </View>

          <Text
            className="text-body-sm text-center mt-8 mb-2"
            style={{ color: '#B4BBBB' /* gray-400 */ }}
          >
            Coming Soon...
          </Text>
          <Text className="text-caption-sm text-center" style={{ color: '#B4BBBB' /* gray-400 */ }}>
            더 많은 뱃지가 추가될 예정이에요
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
