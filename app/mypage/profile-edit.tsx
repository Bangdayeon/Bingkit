import { IconButton } from '@/components/IconButton';
import { TextInput } from '@/components/TextInput';
import { Toggle } from '@/components/Toggle';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import CameraIcon from '@/assets/icons/ic_add.svg';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileEditPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCameraPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['취소', '카메라', '앨범에서 선택'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) {
            /* TODO: 카메라 */
          }
          if (index === 2) {
            /* TODO: 앨범 */
          }
        },
      );
    } else {
      Alert.alert('프로필 사진', undefined, [
        { text: '취소', style: 'cancel' },
        { text: '카메라', onPress: () => {} },
        { text: '앨범에서 선택', onPress: () => {} },
      ]);
    }
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
        <Text className="flex-1 text-center text-title-sm">프로필 편집</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-title-sm">저장</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* 프로필 이미지 */}
        <View className="items-center pt-8 pb-6">
          <View className="relative">
            <View className="w-[98px] h-[98px] rounded-xl bg-green-400 border border-gray-300 dark:border-gray-700" />
            <View className="absolute -bottom-3 -right-3">
              <IconButton
                variant="secondary"
                size={36}
                icon={<CameraIcon width={18} height={18} />}
                onClick={handleCameraPress}
              />
            </View>
          </View>
        </View>

        {/* 폼 */}
        <View className="px-5 gap-5">
          <View className="gap-2">
            <Text className="text-title-sm">이름</Text>
            <TextInput value={name} onChangeText={setName} placeholder="이름을 입력해주세요." />
          </View>
          <View className="gap-2">
            <Text className="text-title-sm">아이디</Text>
            <TextInput
              value={userId}
              onChangeText={setUserId}
              placeholder="아이디를 입력해주세요."
            />
          </View>
          <View className="gap-2">
            <Text className="text-title-sm">한 줄 다짐</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="한 줄 다짐을 입력해주세요." />
          </View>

          <View className="gap-1 pt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-title-sm">계정 비공개</Text>
              <Toggle value={isPrivate} onValueChange={setIsPrivate} />
            </View>
            <Text className="text-body-sm">
              내가 작성한 모든 글과 댓글들이 숨겨져요.{'\n'}다른 사람들이 내 아이디를 검색해서 찾을
              수 없어요.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
