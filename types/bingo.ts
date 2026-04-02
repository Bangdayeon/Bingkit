export type BingoState = 'draft' | 'progress' | 'done';
export type BingoTheme = string;

export interface BingoData {
  id: string;
  title: string;
  grid: string;
  cells: string[];
  maxEdits: number;
  achievedCount: number;
  bingoCount: number;
  dday: number;
  startDate: string | null; // 'YYYY-MM-DD'
  targetDate: string | null; // 'YYYY-MM-DD'
  state: BingoState;
  theme: BingoTheme;
  retrospective: string | null;
}
