import IconButton from '@/components/common/IconButton';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Appearance, Pressable, ScrollView, View } from 'react-native';
import Text from '@/components/common/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AppTheme = 'system' | 'light' | 'dark';
type IconTheme = '기본' | '네온' | '노을' | '태닝';

const APP_THEMES: { value: AppTheme; label: string; leftBg: string; rightBg: string }[] = [
  { value: 'system', label: '시스템', leftBg: '#181C1C', rightBg: '#FDFDFD' },
  { value: 'light', label: '라이트', leftBg: '#FDFDFD', rightBg: '#FDFDFD' },
  { value: 'dark', label: '다크', leftBg: '#181C1C', rightBg: '#181C1C' },
];

const ICON_THEMES: IconTheme[] = ['기본', '네온', '노을', '태닝'];
const THEME_STORAGE_KEY = 'app_theme';

function applyTheme(theme: AppTheme) {
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
}

export default function AppThemePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [appTheme, setAppTheme] = useState<AppTheme>('system');
  const [iconTheme, setIconTheme] = useState<IconTheme>('기본');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setAppTheme(saved);
      }
    });
  }, []);

  const handleThemeChange = (theme: AppTheme) => {
    setAppTheme(theme);
    applyTheme(theme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  const handleSave = () => {
    applyTheme(appTheme);
    router.back();
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
        <Text className="flex-1 text-center text-title-sm">앱 테마</Text>
        <Pressable onPress={handleSave}>
          <Text className="text-label-sm">저장</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* 앱 테마 */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-title-md mb-4">앱 테마</Text>
          {APP_THEMES.map(({ value, label, leftBg, rightBg }) => (
            <Pressable
              key={value}
              onPress={() => handleThemeChange(value)}
              className="flex-row items-center gap-3 py-2"
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#B4BBBB',
                  flexDirection: 'row',
                }}
              >
                <View style={{ flex: 1, backgroundColor: leftBg }} />
                <View style={{ flex: 1, backgroundColor: rightBg }} />
              </View>
              <Text className="flex-1 text-body-md">{label}</Text>
              {appTheme === value && (
                <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View className="h-px bg-gray-200 dark:bg-gray-700" />

        {/* 아이콘 테마 */}
        <View className="px-5 pt-6">
          <Text className="text-title-md mb-4">아이콘 테마</Text>
          {ICON_THEMES.map((theme) => (
            <Pressable
              key={theme}
              onPress={() => setIconTheme(theme)}
              className="flex-row items-center gap-3 py-2"
            >
              <View className="w-[60px] h-[60px] rounded-xl bg-gray-300 dark:bg-gray-700" />
              <Text className="flex-1 text-body-md">{theme}</Text>
              {iconTheme === theme && (
                <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
