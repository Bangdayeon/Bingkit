/**
 * 금칙어 목록
 */
export const BAD_WORDS: string[] = [
  // 욕설
  '시발',
  '씨발',
  '씨팔',
  '시팔',
  '쉬발',
  '쉬팔',
  '씹할',
  '씹',
  '개새끼',
  '개새',
  '병신',
  '지랄',
  '존나',
  '졸라',
  '개같',
  '꺼져',
  '닥쳐',
  '미친놈',
  '미친년',
  '미친새끼',
  '새끼야',
  '개년',
  '개놈',
  '개소리',
  '썅',
  '썅년',
  '썅놈',
  '찐따',
  '등신',
  '멍청이',
  '바보새끼',
  '돼지새끼',
  '뒤져',
  '뒤지',
  '죽어',
  '죽어라',
  '죽여',
  '죽일',
  '살인',
  '자살해',

  // 확장 욕설
  '존내',
  '존나게',
  '존만',
  '좆',
  '좆같',
  '좆나',
  '좆밥',
  '좆까',
  '엿먹어',
  '엿같',
  '개지랄',
  '개병신',
  '쓰레기',
  '또라이',
  '호로새끼',
  '호구',
  '씨부랄',
  '씨부럴',
  '씹새끼',
  '씹년',
  '씹놈',

  // 성적 표현
  '보지',
  '자지',
  '섹스',
  '야동',
  '포르노',
  '창녀',
  '걸레년',
  '갈보',
  '부랄',
  '불알',
  '좆물',
  '섹스',
  '강간',
  '성폭행',
  '딸딸이',
  '자위',
  '야설',
  '음란',
  '음탕',
  '변태',

  // 혐오 / 비하
  '정신병자',
  '노친네',
  '꼴통',
  '흑형',
  '짱깨',
  '쪽발이',
  '쪽바리',
  '외놈',
  '틀딱',
  '한남',
  '한녀',
  '맘충',
  '급식충',

  // 초성 / 축약
  'ㅅㅂ',
  'ㅆㅂ',
  'ㅄ',
  'ㅂㅅ',
  'ㅈㄹ',
  'ㅈㄴ',
  'ㅁㅊ',
  'ㄲㅈ',
  'ㄷㅊ',
  'ㅅㄲ',
];

/**
 * 숫자 → 문자 치환 (우회 방지)
 */
const numberMap: Record<string, string> = {
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '0': 'o',
};

/**
 * 초성 추출 (간단 버전)
 */
function getChosung(text: string): string {
  const CHO = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ];

  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code >= 0 && code <= 11171) {
        return CHO[Math.floor(code / 588)];
      }
      return char;
    })
    .join('');
}

/**
 * 텍스트 정규화
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[0-9]/g, (n) => numberMap[n] || n) // 숫자 치환
    .replace(/[^가-힣a-z]/gi, ''); // 특수문자 제거
}

/**
 * 금칙어 포함 여부 검사
 */
export function containsBadWord(text: string): boolean {
  const normalized = normalize(text);
  const chosung = getChosung(normalized);

  return BAD_WORDS.some((word) => {
    const normalizedWord = normalize(word);
    const chosungWord = getChosung(normalizedWord);

    return normalized.includes(normalizedWord) || chosung.includes(chosungWord);
  });
}
