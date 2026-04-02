export type ConflictModal = {
  requestId: string;
  senderDisplayName: string;
};

export type IncomingRequest = {
  id: string;
  senderId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type UserSearchResult = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_friend: boolean;
  request_status: string | null;
};
