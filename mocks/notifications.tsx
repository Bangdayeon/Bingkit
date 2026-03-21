import { Notification } from '@/types/notifications';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'bingo',
    title: '2026 버킷리스트',
    body: '"제주도 여행 가기" 오늘 해보지 않으실래요?\n빙고 마감일까지 5일 남았습니다!',
    read: false,
  },
  {
    id: '2',
    type: 'bingo',
    title: '봄맞이 빙고',
    body: '"벚꽃 구경하기" 오늘 해보지 않으실래요?\n빙고 마감일까지 12일 남았습니다!',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    title: '2025년 목표 달성 후기',
    body: '댓글: 저도 이번 달 도전해볼게요! 응원합니다 😊',
    read: true,
  },
  {
    id: '4',
    type: 'bingo',
    title: '새해 다짐 빙고',
    body: '"운동 30분 하기" 오늘 해보지 않으실래요?\n빙고 마감일까지 20일 남았습니다!',
    read: true,
  },
  {
    id: '5',
    type: 'popular',
    title: '빙고 완성 후기 공유해요',
    body: '인기 게시글이 되었습니다! 축하드려요 🎉',
    read: false,
  },
];
