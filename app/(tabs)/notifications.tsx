import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchNotifications,
  markNotificationRead,
  type Notification,
} from '@/features/notifications/lib/notifications';
import { supabase } from '@/lib/supabase';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadData);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

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
        {notifications.length === 0 && (
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-body-md text-gray-400">새로운 알림이 없어요!</Text>
          </View>
        )}
        {notifications.map((item) => (
          <Pressable
            key={item.id}
            className={`border-t border-gray-300 dark:border-gray-700 px-4 justify-center ${
              item.is_read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-sky-100 dark:bg-sky-900'
            }`}
            style={{ minHeight: 115 }}
            onPress={async () => {
              await markNotificationRead(item.id);
              setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
              );
              // TODO: target_type / target_id 기반으로 라우팅 추가
            }}
          >
            <Text className="text-title-sm mb-3">{item.type}</Text>
            <Text className="text-body-lg">{item.message}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
