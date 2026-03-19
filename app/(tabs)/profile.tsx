import BadgesPage from '@/components/page/profile/badges';
import ProfilePage from '@/components/page/profile/profile';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Text from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['내 정보', '뱃지'];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Tab Header */}
      <View className="border-b border-gray-300 dark:border-gray-700">
        <View className="flex-row">
          {TABS.map((tab, index) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(index)}
              className="flex-1 items-center py-3"
            >
              <Text
                className={`text-title-lg ${activeTab === index ? '' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* Indicator */}
        <View
          className="absolute bottom-0 h-[3px] bg-gray-900 dark:bg-gray-100 rounded-full w-10"
          style={{
            left: activeTab === 0 ? '25%' : '75%',
            transform: [{ translateX: -20 }],
          }}
        />
      </View>

      {activeTab === 0 ? <ProfilePage /> : <BadgesPage />}
    </SafeAreaView>
  );
}
