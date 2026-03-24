export interface CommentReply {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  likeCount: number;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  likeCount: number;
  replies?: CommentReply[];
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  body: string;
  likeCount: number;
  commentCount: number;
  type: 'bingo' | 'achievement' | 'free';
  bingoItems?: string[][];
}
