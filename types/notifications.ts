export type NotificationType = 'bingo' | 'comment' | 'popular';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
}
