import { ScrollView, View } from 'react-native';

const BADGE_COUNT = 18;

export default function BadgesPage() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row flex-wrap px-5 py-4 gap-3">
        {Array.from({ length: BADGE_COUNT }).map((_, i) => (
          <View
            key={i}
            className="bg-gray-300 dark:bg-gray-700 rounded-xl"
            style={{ width: 96, height: 96 }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
