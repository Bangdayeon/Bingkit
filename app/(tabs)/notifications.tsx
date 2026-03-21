import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="h-[60px] flex-row items-center justify-between px-4 border-b border-gray-300 dark:border-gray-700">
        <View className="w-20" />
        <Pressable onPress={markAllRead} className="items-end">
          <Text className="text-body-md">모두 읽음 처리</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {notifications.map((item) => (
          <Pressable
            key={item.id}
            className={`border-t border-gray-300 dark:border-gray-700 px-4 justify-center ${item.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-sky-100 dark:bg-sky-900'}`}
            style={{ minHeight: 115 }}
            onPress={() =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
              )
            }
          >
            <Text className="text-title-sm mb-3">{item.title}</Text>
            <Text className="text-body-lg">{item.body}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
