import { supabase } from '@/lib/supabase';

const R2_PUBLIC_URL = 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev';

export interface MyProfile {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  feedCount: number;
  followerCount: number;
  followingCount: number;
}

export const fetchMyProfile = async (): Promise<MyProfile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, username, bio, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const { count: feedCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_deleted', false);

  return {
    displayName: profile.display_name,
    username: profile.username,
    bio: profile.bio ?? '',
    avatarUrl: profile.avatar_url ?? null,
    feedCount: feedCount ?? 0,
    followerCount: 0,
    followingCount: 0,
  };
};

export const updateMyProfile = async (data: {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
}): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const updates: Record<string, string> = {
    display_name: data.displayName,
    username: data.username,
    bio: data.bio,
  };
  if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

  const { error } = await supabase.from('users').update(updates).eq('id', user.id);
  if (error) throw error;
};

export const uploadProfileImage = async (uri: string, filename: string): Promise<string> => {
  const ext = filename.split('.').pop() ?? 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const { data, error } = await supabase.functions.invoke('r2-presign', {
    body: { filename, contentType },
  });
  if (error) throw error;

  const file = await fetch(uri);
  const blob = await file.blob();

  const uploadRes = await fetch(data.presignedUrl as string, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });
  if (!uploadRes.ok) throw new Error('이미지 업로드에 실패했습니다.');

  return `${R2_PUBLIC_URL}/${data.key as string}`;
};

export interface LinkedAccount {
  provider: string;
  email: string | null;
}

export const fetchLinkedAccounts = async (): Promise<LinkedAccount[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return (user.identities ?? []).map((identity) => ({
    provider: identity.provider,
    email: (identity.identity_data?.email as string | undefined) ?? null,
  }));
};

export const resetMyBingos = async (): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('bingo_boards')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('deleted_at', null);
  if (error) throw error;
};

export interface MyPost {
  id: string;
  title: string;
  content: string;
  category: 'bingo_board' | 'bingo_achieve' | 'free';
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  return `${months}달 전`;
}

export { timeAgo };

export const fetchMyPosts = async (): Promise<MyPost[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, category, like_count, comment_count, created_at')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category as MyPost['category'],
    likeCount: p.like_count,
    commentCount: p.comment_count,
    createdAt: timeAgo(p.created_at),
  }));
};

export const deleteAccount = async (): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) throw error;

  await supabase.auth.signOut();
};
