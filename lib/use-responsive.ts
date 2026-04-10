import { useWindowDimensions } from 'react-native';

export const TABLET_BREAKPOINT = 768;
export const TABLET_MAX_CONTENT_WIDTH = 600;
export const TABLET_MAX_MODAL_WIDTH = 480;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  return {
    width,
    height,
    isTablet,
    /** 태블릿에서는 최대 600px로 제한된 콘텐츠 너비 */
    contentWidth: isTablet ? Math.min(width, TABLET_MAX_CONTENT_WIDTH) : width,
    /** 태블릿/폰 값 선택 헬퍼 */
    val: <T>(phone: T, tablet: T): T => (isTablet ? tablet : phone),
  };
}
