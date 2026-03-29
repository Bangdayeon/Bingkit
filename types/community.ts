import type { BingoTheme } from './bingo';

export type PostCategory = 'bingo_board' | 'bingo_achieve' | 'free';

export interface CommentReply {
  id: string;
  userId: string;
  author: string;
  isAnonymous: boolean;
  avatarUrl?: string | null;
  body: string;
  createdAt: string;
  likeCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  author: string;
  isAnonymous: boolean;
  avatarUrl?: string | null;
  body: string;
  createdAt: string;
  likeCount: number;
  isDeleted?: boolean;
  replies?: CommentReply[];
}

export interface CommunityPost {
  id: string;
  title: string;
  /** 실제 supabase user_id (소유자 판별용) */
  userId: string;
  /** 표시용 이름: 익명이면 '익명', 아니면 username */
  author: string;
  isAnonymous: boolean;
  /** 비익명 시 실제 프로필 이미지 URL */
  avatarUrl?: string | null;
  timeAgo: string;
  body: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  category: PostCategory;
  /** 첨부 빙고판 데이터 (테마 포함) */
  bingo?: {
    cells: string[];
    grid: string;
    theme: BingoTheme;
  };
  imageUrls?: string[];
}
