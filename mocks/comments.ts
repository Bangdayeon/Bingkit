import { Comment } from '@/types/community';

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      author: 'wellness_lee',
      body: '대단하다!! 저도 얼른 달성하고 싶네요 ㅎㅎ',
      createdAt: '26/03/22  09:31',
      likeCount: 5,
      replies: [
        {
          id: 'r1',
          author: 'user1234',
          body: '같이 열심히 해봐요!! 화이팅 😊',
          createdAt: '26/03/22  09:45',
          likeCount: 2,
        },
      ],
    },
    {
      id: 'c2',
      author: 'happy_kim',
      body: '첫 빙고 달성 축하해요! 다음 목표도 응원합니다 🎉',
      createdAt: '26/03/22  10:12',
      likeCount: 3,
    },
  ],
};
