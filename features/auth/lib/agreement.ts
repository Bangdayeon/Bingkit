import AsyncStorage from '@react-native-async-storage/async-storage';

const AGREEMENT_KEY = '@bingket/terms-agreed';

export async function hasAgreed(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AGREEMENT_KEY);
  return value === 'true';
}

export async function saveAgreement(): Promise<void> {
  await AsyncStorage.setItem(AGREEMENT_KEY, 'true');
}

export async function resetAgreement(): Promise<void> {
  await AsyncStorage.removeItem(AGREEMENT_KEY);
}
