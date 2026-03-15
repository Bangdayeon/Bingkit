import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import { Dot } from '../components/page/onboarding/Dot';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', title: '설명1', description: '첫 번째 설명 내용이 들어갈 자리입니다.' },
  { id: '2', title: '설명2', description: '두 번째 설명 내용이 들어갈 자리입니다.' },
  { id: '3', title: '설명3', description: '세 번째 설명 내용이 들어갈 자리입니다.' },
  { id: '4', title: '설명4', description: '네 번째 설명 내용이 들어갈 자리입니다.' },
  { id: '5', title: '설명5', description: '다섯 번째 설명 내용이 들어갈 자리입니다.' },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleMomentumScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-5">
            <Text className="text-2xl font-medium ">{item.title}</Text>
            <Text className="mt-4 text-center text-base text-gray-500">{item.description}</Text>
          </View>
        )}
      />

      {/* 하단 점 */}
      <View className="items-center pb-12">
        <View className="flex-row items-center gap-2 mb-8">
          {slides.map((_, index) => (
            <Dot key={index} active={currentIndex === index} onPress={() => scrollToIndex(index)} />
          ))}
        </View>

        {/* 버튼 */}
        <Button
          label={isLast ? '시작하기' : '다음'}
          onClick={() => {
            if (isLast) {
              router.replace('/(tabs)');
            } else {
              scrollToIndex(currentIndex + 1);
            }
          }}
          style={{ width: width - 40 }}
        />
      </View>
    </SafeAreaView>
  );
}
