import { IconButton } from '@/components/IconButton';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import { useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal } from '@/components/Modal';
import { useState } from 'react';

interface RowItemProps {
  label: string;
  onPress: () => void;
}

function RowItem({ label, onPress }: RowItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-title-sm">{label}</Text>
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <BackArrowIcon width={20} height={20} />
      </View>
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSecessionModal, setShowSecessionModal] = useState(false);

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
        <Text className="flex-1 text-center text-title-sm">계정 관리</Text>
        <View className="w-8" />
      </View>

      {/* 연동 계정 정보 */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-title-sm mb-4">연동 계정 정보</Text>
        <View className="flex-row items-center gap-3">
          <View className="w-6 h-6 rounded-md bg-[#FEE500] items-center justify-center">
            <Image
              source={require('@/assets/icons/kakao_logo.png')}
              style={{ width: 14, height: 14 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-title-sm">카카오톡</Text>
          <Text className="text-title-sm text-gray-500 dark:text-gray-400 ml-auto">
            dfdsfdf@kakao.com
          </Text>
        </View>
      </View>

      <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

      <RowItem
        label="빙고 초기화"
        onPress={() => {
          setShowResetModal(true);
        }}
      />
      <RowItem
        label="회원 탈퇴"
        onPress={() => {
          setShowSecessionModal(true);
        }}
      />

      {/* 계정 초기화 모달 */}
      <Modal
        visible={showResetModal}
        title="정말로 빙고를 초기화 하시겠어요?"
        body={`• 작성한 모든 빙고가 삭제돼요.\n• 글과 댓글은 남아요.\n• 계정과 프로필은 유지돼요.`}
        variant="warning"
        cancelLabel="취소하기"
        confirmLabel="빙고 초기화 하기"
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          setShowResetModal(false);
          router.back();
        }}
        onDismiss={() => setShowResetModal(false)}
      />

      {/* 회원 탈퇴 모달 */}
      <Modal
        visible={showSecessionModal}
        title="정말로 탈퇴를 하시겠어요?"
        body={`• 계정이 완전히 삭제돼요.\n• 계정 삭제 후 데이터 복구가 불가능해요.\n• 작성한 글과 댓글은 (알 수 없음)으로 남아요`}
        variant="warning"
        cancelLabel="취소하기"
        confirmLabel="회원 탈퇴하기"
        onCancel={() => setShowSecessionModal(false)}
        onConfirm={() => {
          setShowSecessionModal(false);
          router.back();
        }}
        onDismiss={() => setShowSecessionModal(false)}
      />
    </View>
  );
}
