import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Text } from '@/components/Text';
import { badgeEvent, type BadgeEarnedInfo } from '@/lib/badge-event';

const { width } = Dimensions.get('window');

// 애니메이션이 끝나기 전 터치 차단 시간 (ms)
const TOUCH_LOCK_MS = 1200;

export function BadgeCelebration() {
  const [badge, setBadge] = useState<BadgeEarnedInfo | null>(null);
  const [touchable, setTouchable] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiRef = useRef<ConfettiCannon | null>(null);

  // 뱃지 이미지 애니메이션
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  // 토스트 애니메이션
  const toastY = useSharedValue(20);
  const toastOpacity = useSharedValue(0);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const toastStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: toastY.value }],
    opacity: toastOpacity.value,
  }));

  useEffect(() => {
    badgeEvent.register((earned) => {
      // 기존 타이머 클리어
      if (timerRef.current) clearTimeout(timerRef.current);

      // 애니메이션 초기화
      scale.value = 0;
      opacity.value = 0;
      toastY.value = 20;
      toastOpacity.value = 0;

      setTouchable(false);
      setBadge(earned);

      // 뱃지 scale-in
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });

      // 토스트 slide-up (300ms 딜레이)
      toastY.value = withDelay(300, withSpring(0, { damping: 14 }));
      toastOpacity.value = withDelay(300, withTiming(1, { duration: 250 }));

      // 애니메이션 완료 후 터치 허용
      timerRef.current = setTimeout(() => setTouchable(true), TOUCH_LOCK_MS);
    });

    return () => {
      badgeEvent.unregister();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // badge 상태가 설정된 직후 폭죽 발사
  useEffect(() => {
    if (badge) {
      setTimeout(() => confettiRef.current?.start(), 100);
    }
  }, [badge]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    opacity.value = withTiming(0, { duration: 200 });
    toastOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => setBadge(null), 200);
  };

  if (!badge) return null;

  return (
    <Modal transparent animationType="none" visible statusBarTranslucent>
      {/* 폭죽 — 화면 상단 중앙에서 발사 */}
      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={{ x: width / 2, y: -20 }}
        autoStart={false}
        fadeOut
        explosionSpeed={350}
        fallSpeed={3000}
        colors={['#F07840', '#28C8DE', '#FFD600', '#A78BFA', '#34D399', '#F472B6']}
      />

      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={touchable ? dismiss : undefined}
      >
        {/* 뱃지 이미지 */}
        <Animated.View style={[{ alignItems: 'center' }, badgeStyle]}>
          <Image
            source={{ uri: badge.iconUrl }}
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
          <Text className="text-title-sm mt-3" style={{ color: '#FDFDFD' }}>
            {badge.name}
          </Text>
          <Text className="text-label-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            새 뱃지 획득!
          </Text>
        </Animated.View>

        {/* 토스트 */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 80,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(24,28,28,0.9)',
            },
            toastStyle,
          ]}
        >
          <Text className="text-body-sm" style={{ color: '#FDFDFD' }}>
            {badge.message}
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
