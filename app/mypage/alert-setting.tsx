import { IconButton } from '@/components/IconButton';
import { Toggle } from '@/components/Toggle';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bingket/alert-settings';

interface AlertSettings {
  bingoDeadline: boolean;
  bingoDaily: boolean;
  communityPopular: boolean;
  communityComment: boolean;
  communityLike: boolean;
  eventPush: boolean;
}

const DEFAULT_SETTINGS: AlertSettings = {
  bingoDeadline: false,
  bingoDaily: true,
  communityPopular: false,
  communityComment: true,
  communityLike: false,
  eventPush: true,
};

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
  const [settings, setSettings] = useState<AlertSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        } catch {
          // 파싱 실패 시 기본값 유지
        }
      }
    });
  }, []);

  const update = (patch: Partial<AlertSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const allAlert = Object.values(settings).every(Boolean);

  const handleAllAlert = (v: boolean) => {
    update({
      bingoDeadline: v,
      bingoDaily: v,
      communityPopular: v,
      communityComment: v,
      communityLike: v,
      eventPush: v,
    });
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
        <ToggleRow
          label="기간 임박 알림"
          value={settings.bingoDeadline}
          onValueChange={(v) => update({ bingoDeadline: v })}
        />
        <ToggleRow
          label="데일리 알림"
          value={settings.bingoDaily}
          onValueChange={(v) => update({ bingoDaily: v })}
        />

        <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

        <View className="px-5 pt-3 pb-1">
          <Text className="text-title-md">커뮤니티 알림</Text>
        </View>
        <ToggleRow
          label="인기글 알림"
          value={settings.communityPopular}
          onValueChange={(v) => update({ communityPopular: v })}
        />
        <ToggleRow
          label="댓글 및 대댓글 알림"
          value={settings.communityComment}
          onValueChange={(v) => update({ communityComment: v })}
        />
        <ToggleRow
          label="좋아요 알림"
          value={settings.communityLike}
          onValueChange={(v) => update({ communityLike: v })}
        />

        <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

        <View className="px-5 pt-3 pb-1">
          <Text className="text-title-md">이벤트 및 혜택 알림</Text>
        </View>
        <ToggleRow
          label="앱 푸시"
          value={settings.eventPush}
          onValueChange={(v) => update({ eventPush: v })}
        />
      </ScrollView>
    </View>
  );
}
