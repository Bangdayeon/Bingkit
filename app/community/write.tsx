import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput as RNTextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/Text';
import ArrowBackIcon from '@/assets/icons/ic_arrow_back.svg';
// import CameraIcon from '@/assets/icons/ic_camera.svg';
import CheckIcon from '@/assets/icons/ic_check.svg';
import type { PostCategory } from '@/types/community';
import type { BingoData, BingoState } from '@/types/bingo';
import { getThemeImage, FIGMA_W, FIGMA_H, GRID_CONFIGS } from '@/features/bingo/lib/theme-config';
import { fetchMyBingosForPost, createPost, updatePost } from '@/features/community/lib/community';
import { checkAndAwardBadges } from '@/lib/badge-checker';

const HEADER_H = 60;
const TITLE_H = 60;
const TOOLBAR_H = 44;
const MAX_IMAGES = 5;

const TYPE_OPTIONS: Array<{ value: PostCategory; label: string }> = [
  { value: 'bingo_board', label: '빙고판' },
  { value: 'bingo_achieve', label: '빙고 달성' },
  { value: 'free', label: '자유게시판' },
];

const STATE_LABELS: Record<BingoState, string> = {
  draft: '제작 중',
  progress: '진행 중',
  done: '완료',
};

const STATE_COLORS: Record<BingoState, string> = {
  draft: '#929898' /* gray-500 */,
  progress: '#48BE30' /* green-600 */,
  done: '#28C8DE' /* sky-500 */,
};

function GridIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 2.5 }}>
      {[...Array(9)].map((_, i) => (
        <View
          key={i}
          style={{ width: 5.5, height: 5.5, backgroundColor: color, borderRadius: 1 }}
        />
      ))}
    </View>
  );
}

function BingoPreview({ bingo }: { bingo: BingoData }) {
  const [cols, rows] = bingo.grid.split('x').map(Number);
  const availableWidth = Dimensions.get('window').width - 40;
  const image = getThemeImage(bingo.theme, bingo.grid);

  if (image !== null) {
    const scale = availableWidth / FIGMA_W;
    const cardHeight = FIGMA_H * scale;
    const cfg = GRID_CONFIGS[bingo.grid];
    const gridTop = cfg.top * scale;
    const gridLeft = cfg.left * scale;
    const cellW = cfg.cellW * scale;
    const cellH = cfg.cellH * scale;
    const gapX = cfg.gapX * scale;
    const gapY = cfg.gapY * scale;

    return (
      <View style={{ width: availableWidth, height: cardHeight }}>
        <Image
          source={image}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {Array.from({ length: cols * rows }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: gridLeft + col * (cellW + gapX),
                top: gridTop + row * (cellH + gapY),
                width: cellW,
                height: cellH,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <Text
                className="text-caption-sm text-center"
                style={{ color: '#181C1C' /* gray-900 */ }}
                numberOfLines={2}
              >
                {bingo.cells[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {bingo.cells.map((text, i) => (
        <View
          key={i}
          style={{
            width: `${(100 - (cols - 1) * 2) / cols}%` as unknown as number,
            aspectRatio: 1,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#D2D6D6' /* gray-300 */,
            backgroundColor: '#FDFDFD' /* white */,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <Text
            className="text-caption-sm text-center"
            style={{ color: '#181C1C' /* gray-900 */ }}
            numberOfLines={2}
          >
            {text}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function CommunityWriteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    postId?: string;
    initTitle?: string;
    initContent?: string;
    initCategory?: string;
    initImageUrls?: string;
    initIsAnonymous?: string;
  }>();
  const isEditMode = !!params.postId;

  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const iconColor = isDark ? '#F6F7F7' /* gray-100 */ : '#4C5252'; /* gray-700 */

  const [type, setType] = useState<PostCategory | null>(
    (params.initCategory as PostCategory | undefined) ?? null,
  );
  const [title, setTitle] = useState(params.initTitle ?? '');
  const [content, setContent] = useState(params.initContent ?? '');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(() => {
    try {
      return params.initImageUrls ? (JSON.parse(params.initImageUrls) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [attachedBingo, setAttachedBingo] = useState<BingoData | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showBingoModal, setShowBingoModal] = useState(false);

  const [myBingos, setMyBingos] = useState<BingoData[]>([]);
  const [loadingBingos, setLoadingBingos] = useState(false);
  const bingosLoadedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    type !== null && title.trim().length > 0 && content.trim().length > 0 && !isSubmitting;

  const handleOpenBingoModal = async () => {
    setShowBingoModal(true);
    if (bingosLoadedRef.current) return;
    setLoadingBingos(true);
    try {
      const bingos = await fetchMyBingosForPost();
      setMyBingos(bingos);
      bingosLoadedRef.current = true;
    } finally {
      setLoadingBingos(false);
    }
  };

  const totalImageCount = existingImageUrls.length + images.length;

  const handleCameraCapture = async () => {
    setShowCameraMenu(false);
    if (totalImageCount >= MAX_IMAGES) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('카메라 권한 필요', '설정에서 카메라 접근을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImages((prev) =>
        [...prev, result.assets[0]].slice(0, MAX_IMAGES - existingImageUrls.length),
      );
    }
  };

  const handleGalleryPick = async () => {
    setShowCameraMenu(false);
    if (totalImageCount >= MAX_IMAGES) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('앨범 권한 필요', '설정에서 사진 접근을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - totalImageCount,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) =>
        [...prev, ...result.assets].slice(0, MAX_IMAGES - existingImageUrls.length),
      );
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updatePost({
          postId: params.postId!,
          category: type!,
          title,
          content,
          isAnonymous,
          existingImageUrls,
          newImageUris: images.map((img) => ({
            uri: img.uri,
            mimeType: img.mimeType ?? 'image/jpeg',
          })),
          bingo: attachedBingo,
        });
      } else {
        await createPost({
          category: type!,
          title,
          content,
          isAnonymous,
          imageUris: images.map((img) => ({
            uri: img.uri,
            mimeType: img.mimeType ?? 'image/jpeg',
          })),
          bingo: attachedBingo,
        });
        checkAndAwardBadges('post');
      }
      router.back();
    } catch (err) {
      Alert.alert(
        '오류',
        err instanceof Error
          ? err.message
          : isEditMode
            ? '게시글 수정에 실패했습니다.'
            : '게시글 작성에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      {/* 헤더 */}
      <View
        className="flex-row items-center border-b border-gray-300 dark:border-gray-700"
        style={{ height: HEADER_H }}
      >
        <View style={{ width: 56 }} className="pl-4">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowBackIcon width={20} height={20} color={iconColor} />
          </Pressable>
        </View>
        <Text className="flex-1 text-title-sm text-center">
          {isEditMode ? '게시글 수정하기' : '게시글 작성하기'}
        </Text>
        <View style={{ width: 56 }} className="pr-4 items-end">
          <Pressable onPress={handleSubmit} disabled={!canSubmit} hitSlop={8}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#28C8DE" /* sky-500 */ />
            ) : (
              <Text
                className="text-label-sm"
                style={{ color: canSubmit ? '#28C8DE' /* sky-500 */ : '#B4BBBB' /* gray-400 */ }}
              >
                등록
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* 제목 */}
        <View className="border-b border-gray-300 dark:border-gray-700" style={{ height: TITLE_H }}>
          <RNTextInput
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요."
            placeholderTextColor="#929898" /* gray-500 */
            style={{
              flex: 1,
              paddingHorizontal: 20,
              fontSize: 18,
              fontWeight: '500',
              lineHeight: 24,
              color: isDark ? '#F6F7F7' : '#181C1C' /* gray-100 : gray-900 */,
            }}
          />
        </View>

        {/* 툴바 */}
        <View
          className="flex-row items-center px-5 gap-4 border-b border-gray-300 dark:border-gray-700"
          style={{ height: TOOLBAR_H }}
        >
          {/* 게시판 선택 드롭다운 */}
          <Pressable
            onPress={() => setShowTypeDropdown((v) => !v)}
            className="flex-row items-center gap-1"
            hitSlop={8}
          >
            <Text style={{ color: '#EF4444' /* red-500 */, fontSize: 18, lineHeight: 20 }}>*</Text>
            <Text className="text-body-sm" style={{ color: '#181C1C' /* gray-900 */ }}>
              {type ? TYPE_OPTIONS.find((o) => o.value === type)?.label : '게시판 선택'}
            </Text>
            <Text style={{ color: '#929898', fontSize: 9, lineHeight: 14 }}>▼</Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          {/* 카메라 (최대 이미지 수 미달 시만 활성) */}
          {/* <Pressable
            onPress={() => totalImageCount < MAX_IMAGES && setShowCameraMenu(true)}
            hitSlop={8}
          >
            <CameraIcon
              width={24}
              height={24}
              color={totalImageCount >= MAX_IMAGES ? '#B4BBBB'  : iconColor}
            />
            {totalImageCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  backgroundColor: '#28C8DE' ,
                  borderRadius: 8,
                  minWidth: 14,
                  height: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 9, lineHeight: 12 }}>
                  {totalImageCount}
                </Text>
              </View>
            )}
          </Pressable> */}

          {/* 빙고 첨부 */}
          <Pressable onPress={handleOpenBingoModal} hitSlop={8}>
            <GridIcon color={attachedBingo ? '#28C8DE' /* sky-500 */ : iconColor} />
          </Pressable>
        </View>

        {/* 익명 토글 */}
        <View
          className="flex-row justify-end items-center px-5 border-b border-gray-300 dark:border-gray-700"
          style={{ height: 40 }}
        >
          <Pressable
            onPress={() => setIsAnonymous((v) => !v)}
            className="flex-row items-center gap-1"
            hitSlop={8}
          >
            <Text
              className="text-body-sm"
              style={{ color: isAnonymous ? '#28C8DE' /* sky-500 */ : '#B4BBBB' /* gray-400 */ }}
            >
              익명
            </Text>
            <CheckIcon
              width={18}
              height={18}
              color={isAnonymous ? '#28C8DE' /* sky-500 */ : '#B4BBBB' /* gray-400 */}
            />
          </Pressable>
        </View>

        {/* 본문 */}
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {/* 이미지 썸네일 */}
          {totalImageCount > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {existingImageUrls.map((url, i) => (
                <View key={`existing-${i}`} style={{ position: 'relative' }}>
                  <Image source={{ uri: url }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  <Pressable
                    onPress={() => removeExistingImage(i)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#4C5252' /* gray-700 */,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, lineHeight: 14 }}>×</Text>
                  </Pressable>
                </View>
              ))}
              {images.map((img, i) => (
                <View key={`new-${i}`} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: img.uri }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                  />
                  <Pressable
                    onPress={() => removeImage(i)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#4C5252' /* gray-700 */,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, lineHeight: 14 }}>×</Text>
                  </Pressable>
                </View>
              ))}
              {totalImageCount < MAX_IMAGES && (
                <Pressable
                  onPress={() => setShowCameraMenu(true)}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#D2D6D6' /* gray-300 */,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#929898', fontSize: 22, lineHeight: 24 }}>+</Text>
                  <Text style={{ color: '#929898', fontSize: 10, lineHeight: 14 }}>
                    {totalImageCount}/{MAX_IMAGES}
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}

          {/* 첨부 빙고 미리보기 */}
          {attachedBingo && (
            <View className="px-5 pt-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="text-caption-sm"
                    style={{ color: STATE_COLORS[attachedBingo.state] }}
                  >
                    {STATE_LABELS[attachedBingo.state]}
                  </Text>
                  <Text className="text-label-sm" style={{ color: '#929898' /* gray-500 */ }}>
                    {attachedBingo.title}
                  </Text>
                </View>
                <Pressable onPress={() => setAttachedBingo(null)} hitSlop={8}>
                  <Text style={{ color: '#929898', fontSize: 18, lineHeight: 20 }}>×</Text>
                </Pressable>
              </View>
              <BingoPreview bingo={attachedBingo} />
            </View>
          )}

          <RNTextInput
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력해주세요."
            placeholderTextColor="#929898" /* gray-500 */
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 200,
              paddingHorizontal: 20,
              paddingTop: 16,
              fontSize: 16,
              lineHeight: 22,
              color: isDark ? '#F6F7F7' : '#181C1C' /* gray-100 : gray-900 */,
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 게시판 선택 드롭다운 메뉴 */}
      {showTypeDropdown && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 }}
            onPress={() => setShowTypeDropdown(false)}
          />
          <View
            className="absolute bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            style={{
              top: HEADER_H + TITLE_H + TOOLBAR_H,
              left: 20,
              zIndex: 20,
              minWidth: 130,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {TYPE_OPTIONS.map((option, i) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setType(option.value);
                  setShowTypeDropdown(false);
                }}
                className={`px-4 py-3${i < TYPE_OPTIONS.length - 1 ? ' border-b border-gray-100 dark:border-gray-700' : ''}`}
              >
                <Text
                  className="text-body-sm"
                  style={{
                    color:
                      type === option.value
                        ? '#28C8DE' /* sky-500 */
                        : isDark
                          ? '#F6F7F7'
                          : '#181C1C',
                    fontWeight: type === option.value ? '600' : '400',
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* 카메라 메뉴 바텀시트 */}
      <Modal
        visible={showCameraMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCameraMenu(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(115,115,115,0.5)' }}
          onPress={() => setShowCameraMenu(false)}
        />
        <View
          className="bg-white dark:bg-gray-900 rounded-t-3xl"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center pt-3 pb-4">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          </View>
          <Pressable
            onPress={handleCameraCapture}
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-800"
          >
            <Text className="text-body-lg">카메라로 촬영하기</Text>
          </Pressable>
          <Pressable onPress={handleGalleryPick} className="px-6 py-4">
            <Text className="text-body-lg">앨범에서 선택하기</Text>
          </Pressable>
        </View>
      </Modal>

      {/* 빙고 선택 모달 */}
      <Modal
        visible={showBingoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBingoModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(115,115,115,0.5)' }}
          onPress={() => setShowBingoModal(false)}
        />
        <View
          className="bg-white dark:bg-gray-900 rounded-t-3xl"
          style={{ maxHeight: '60%', paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-title-sm">내 빙고 선택</Text>
            <Pressable onPress={() => setShowBingoModal(false)} hitSlop={8}>
              <Text style={{ color: '#929898', fontSize: 20, lineHeight: 24 }}>×</Text>
            </Pressable>
          </View>

          {loadingBingos ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator color="#28C8DE" /* sky-500 */ />
            </View>
          ) : myBingos.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-body-sm" style={{ color: '#929898' /* gray-500 */ }}>
                빙고가 없습니다.
              </Text>
            </View>
          ) : (
            <ScrollView>
              {myBingos.map((bingo) => (
                <Pressable
                  key={bingo.id}
                  onPress={() => {
                    setAttachedBingo(bingo);
                    setShowBingoModal(false);
                  }}
                  className={`px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-row items-center justify-between${attachedBingo?.id === bingo.id ? ' bg-green-50 dark:bg-gray-800' : ''}`}
                >
                  <View>
                    <Text className="text-label-sm">{bingo.title}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text
                        className="text-caption-sm"
                        style={{ color: STATE_COLORS[bingo.state] }}
                      >
                        {STATE_LABELS[bingo.state]}
                      </Text>
                      <Text className="text-body-sm" style={{ color: '#929898' /* gray-500 */ }}>
                        {bingo.grid}
                        {bingo.state !== 'draft' ? ` · ${bingo.achievedCount}칸 달성` : ''}
                      </Text>
                    </View>
                  </View>
                  {attachedBingo?.id === bingo.id && (
                    <Text style={{ color: '#48BE30' /* green-600 */, fontSize: 18 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
