export interface BadgeEarnedInfo {
  key: string; // 'cell_1', 'like_2', etc.
  name: string; // 표시용 한글 이름
  iconUrl: string; // R2 이미지 URL
  message: string; // 토스트 문구
}

type Handler = (badge: BadgeEarnedInfo) => void;

let _handler: Handler | null = null;

export const badgeEvent = {
  register: (fn: Handler) => {
    _handler = fn;
  },
  unregister: () => {
    _handler = null;
  },
  emit: (badge: BadgeEarnedInfo) => {
    _handler?.(badge);
  },
};
