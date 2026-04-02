/**
 * 화면 간 일시적인 선택 상태를 전달하기 위한 모듈 레벨 저장소.
 * (Zustand 도입 전 임시 패턴)
 *
 * 사용처:
 *  - friend-list(select mode) → battle: 선택한 친구
 *  - battle-select-board → battle-check: 선택한 빙고판 ID
 */
import type { Friend } from './battle';

let _selectedFriend: Friend | null = null;
let _selectedBoardId: string | null = null;
let _selectedBoardTitle: string | null = null;
let _selectedRequestId: string | null = null;

export const setSelectedFriend = (f: Friend | null): void => {
  _selectedFriend = f;
};
export const getSelectedFriend = (): Friend | null => _selectedFriend;
export const clearSelectedFriend = (): void => {
  _selectedFriend = null;
};

export const setSelectedBoardId = (id: string | null): void => {
  _selectedBoardId = id;
};
export const getSelectedBoardId = (): string | null => _selectedBoardId;
export const clearSelectedBoardId = (): void => {
  _selectedBoardId = null;
};

export const setSelectedBoardTitle = (title: string | null): void => {
  _selectedBoardTitle = title;
};
export const getSelectedBoardTitle = (): string | null => _selectedBoardTitle;
export const clearSelectedBoardTitle = (): void => {
  _selectedBoardTitle = null;
};

export const setSelectedRequestId = (id: string | null): void => {
  _selectedRequestId = id;
};
export const getSelectedRequestId = (): string | null => _selectedRequestId;
export const clearSelectedRequestId = (): void => {
  _selectedRequestId = null;
};
