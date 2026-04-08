import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store는 값 하나당 2048바이트 제한이 있어
// Supabase 세션 JSON이 이를 초과하므로 청크로 분할해서 저장
const CHUNK_SIZE = 1900;

const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const countStr = await SecureStore.getItemAsync(`${key}__chunks`);
    if (!countStr) return SecureStore.getItemAsync(key);
    const count = parseInt(countStr, 10);
    const chunks: string[] = [];
    for (let i = 0; i < count; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}__chunk__${i}`);
      if (chunk === null) return null;
      chunks.push(chunk);
    }
    return chunks.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(
        `${key}__chunk__${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
    await SecureStore.setItemAsync(`${key}__chunks`, String(count));
  },
  async removeItem(key: string): Promise<void> {
    const countStr = await SecureStore.getItemAsync(`${key}__chunks`);
    if (!countStr) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    const count = parseInt(countStr, 10);
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${key}__chunk__${i}`);
    }
    await SecureStore.deleteItemAsync(`${key}__chunks`);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
