import { AppleButton } from '@/features/auth/components/AppleButton';
import { GoogleButton } from '@/features/auth/components/GoogleButton';
import { GuestLoginButton } from '@/features/auth/components/GuestLoginButton';
import { KakaoButton } from '@/features/auth/components/KakaoButton';
import { AgreementModal } from '@/features/auth/components/AgreementModal';
import { useAgreement } from '@/features/auth/use-agreement';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { requireAgreement, modalVisible, onAgree, onDismiss } = useAgreement();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center">
      <View className="flex-1 w-full md:max-w-[480px] items-center justify-center">
        <Image
          source={require('../../assets/logoWithText_300.png')}
          style={{ width: 150, height: 200 }}
          resizeMode="contain"
        />
      </View>

      <View className="w-full md:max-w-[480px] px-5 pb-8 gap-3">
        <KakaoButton requireAgreement={requireAgreement} />
        <AppleButton requireAgreement={requireAgreement} />
        <GoogleButton requireAgreement={requireAgreement} />
        <GuestLoginButton requireAgreement={requireAgreement} />
      </View>

      <AgreementModal visible={modalVisible} onAgree={onAgree} onDismiss={onDismiss} />
    </SafeAreaView>
  );
}
