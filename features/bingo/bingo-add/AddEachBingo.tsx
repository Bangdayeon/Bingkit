import { Modal } from '@/components/Modal';
import { useState } from 'react';
import { Dimensions, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Text';

interface AddBingoProps {
  selectedGrid: string;
  cells: string[];
  onCellsChange: (cells: string[]) => void;
}

export function AddEachBingo({ selectedGrid, cells, onCellsChange }: AddBingoProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');

  const [cols, rows] = selectedGrid.split('x').map(Number);
  const gap = 6;
  const availableWidth = Dimensions.get('window').width - 40;
  const cellSize = (availableWidth - gap * (cols - 1)) / cols;
  const textStyle = selectedGrid === '3x3' ? 'text-body-sm' : 'text-caption-md';

  const handleCellPress = (index: number) => {
    setInputText(cells[index] ?? '');
    setSelectedIndex(index);
  };

  const handleSave = () => {
    if (selectedIndex === null) return;
    const updated = [...cells];
    updated[selectedIndex] = inputText;
    onCellsChange(updated);
    setSelectedIndex(null);
  };

  const handleCancel = () => {
    setSelectedIndex(null);
  };

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleCellPress(i)}
            activeOpacity={0.7}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D2D6D6' /* gray-300 */,
              backgroundColor: '#FDFDFD' /* white */,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            <Text className={`${textStyle} text-center`} numberOfLines={3}>
              {cells[i] ?? ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={selectedIndex !== null}
        title="빙고 내용을 입력해주세요"
        body={
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="내용을 입력하세요."
            placeholderTextColor="#929898" /* gray-500 */
            multiline
            className="text-body-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
          />
        }
        variant="default"
        cancelLabel="취소하기"
        confirmLabel="저장하기"
        onCancel={handleCancel}
        onConfirm={handleSave}
        onDismiss={handleCancel}
      />
    </>
  );
}
