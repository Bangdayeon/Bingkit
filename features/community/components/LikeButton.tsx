import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import LikeOffIcon from '@/assets/icons/ic_favorite_off.svg';
import LikeOnIcon from '@/assets/icons/ic_favorite_on.svg';
import { togglePostLike } from '@/features/community/lib/community';
import { checkAndAwardBadges } from '@/lib/badge-checker';

const SIZES = { sm: 18, md: 20 } as const;

interface LikeButtonProps {
  count: number;
  iconColor: string;
  size?: keyof typeof SIZES;
  postId?: string;
  initialLiked?: boolean;
}

export function LikeButton({
  count,
  iconColor,
  size = 'md',
  postId,
  initialLiked = false,
}: LikeButtonProps) {
  const iconSize = SIZES[size];
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(count);
  const [showFloat, setShowFloat] = useState(false);

  const floatY = useRef(new Animated.Value(0)).current;
  const floatOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(count);
  }, [initialLiked, count]);

  useEffect(() => {
    return () => {
      floatY.stopAnimation();
      floatOpacity.stopAnimation();
    };
  }, []);

  const handlePress = async () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : likeCount - 1;

    // Optimistic update
    setLiked(nextLiked);
    setLikeCount(nextCount);

    if (nextLiked) {
      setShowFloat(true);
      floatY.setValue(0);
      floatOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(floatY, { toValue: -40, duration: 600, useNativeDriver: true }),
        Animated.timing(floatOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start(() => setShowFloat(false));
    }

    if (postId) {
      try {
        await togglePostLike(postId, nextLiked);
        if (nextLiked) checkAndAwardBadges('like');
      } catch {
        // 실패 시 롤백
        setLiked(liked);
        setLikeCount(likeCount);
      }
    }
  };

  return (
    <Pressable onPress={handlePress} className="flex-row items-center gap-1">
      <View style={{ width: iconSize, height: iconSize }}>
        {liked ? (
          <LikeOnIcon width={iconSize} height={iconSize} color="#E02828" /* red-500 */ />
        ) : (
          <LikeOffIcon width={iconSize} height={iconSize} color={iconColor} />
        )}
        {showFloat && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              transform: [{ translateY: floatY }],
              opacity: floatOpacity,
            }}
          >
            <LikeOnIcon width={iconSize} height={iconSize} color="#E02828" /* red-500 */ />
          </Animated.View>
        )}
      </View>
      <Text className="text-body-sm">{likeCount}</Text>
    </Pressable>
  );
}
