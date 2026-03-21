import { IconButton } from '@/components/IconButton';
import { Toggle } from '@/components/Toggle';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  bold?: boolean;
}

function ToggleRow({ label, value, onValueChange, bold = false }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className={bold ? 'text-title-md' : 'text-body-lg'}>{label}</Text>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function AlertSettingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bingoDeadline, setBingoDeadline] = useState(false);
  const [bingoDaily, setBingoDaily] = useState(true);
  const [communityPopular, setCommunityPopular] = useState(false);
  const [communityComment, setCommunityComment] = useState(true);
  const [communityLike, setCommunityLike] = useState(false);
  const [eventPush, setEventPush] = useState(true);

  const allValues = [
    bingoDeadline,
    bingoDaily,
    communityPopular,
    communityComment,
    communityLike,
    eventPush,
  ];
  const allAlert = allValues.every(Boolean);

  const handleAllAlert = (v: boolean) => {
    setBingoDeadline(v);
    setBingoDaily(v);
    setCommunityPopular(v);
    setCommunityComment(v);
    setCommunityLike(v);
    setEventPush(v);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-[60px] flex-row items-center px-4 border-b border-gray-300 dark:border-gray-700">
        <IconButton
          variant="ghost"
          size={32}
          icon={<BackArrowIcon width={20} height={20} />}
          onClick={() => router.back()}
        />
        <Text className="flex-1 text-center text-title-sm">알림 설정</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1">
        <ToggleRow label="전체 알림" value={allAlert} onValueChange={handleAllAlert} />

        <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

        <View className="px-5 pt-3 pb-1">
          <Text className="text-title-md">빙고 알림</Text>
        </View>
        <ToggleRow label="기간 임박 알림" value={bingoDeadline} onValueChange={setBingoDeadline} />
        <ToggleRow label="데일리 알림" value={bingoDaily} onValueChange={setBingoDaily} />

        <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

        <View className="px-5 pt-3 pb-1">
          <Text className="text-title-md">커뮤니티 알림</Text>
        </View>
        <ToggleRow
          label="인기글 알림"
          value={communityPopular}
          onValueChange={setCommunityPopular}
        />
        <ToggleRow
          label="댓글 및 대댓글 알림"
          value={communityComment}
          onValueChange={setCommunityComment}
        />
        <ToggleRow label="좋아요 알림" value={communityLike} onValueChange={setCommunityLike} />

        <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

        <View className="px-5 pt-3 pb-1">
          <Text className="text-title-md">이벤트 및 혜택 알림</Text>
        </View>
        <ToggleRow label="앱 푸시" value={eventPush} onValueChange={setEventPush} />
      </ScrollView>
    </View>
  );
}
