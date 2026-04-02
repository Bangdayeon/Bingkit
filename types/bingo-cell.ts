export interface BingoCellDetail {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  memo: string;
}

export type GridType = '3x3' | '4x3' | '4x4' | 'check';
