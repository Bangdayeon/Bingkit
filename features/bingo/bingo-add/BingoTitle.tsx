import { View } from 'react-native';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/TextInput';
import { useState } from 'react';

export function BingoTitle() {
  const [title, setTitle] = useState('');
  return (
    <View className="px-5 pt-5 pb-8">
      <Text className="text-title-md mb-2">제목</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="제목을 입력해주세요." />
    </View>
  );
}
