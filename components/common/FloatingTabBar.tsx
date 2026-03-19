import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, useColorScheme, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import HomeOff from '@/assets/icons/home_off.svg';
import HomeOn from '@/assets/icons/home_on.svg';
import CommunityOff from '@/assets/icons/community_off.svg';
import CommunityOn from '@/assets/icons/community_on.svg';
import AlertOff from '@/assets/icons/alert_off.svg';
import AlertOn from '@/assets/icons/alert_on.svg';
import MypageOff from '@/assets/icons/mypage_off.svg';
import MypageOn from '@/assets/icons/mypage_on.svg';

import IconButton from './IconButton';

const TAB_ICONS: Record<string, { on: React.FC<SvgProps>; off: React.FC<SvgProps> }> = {
  index: { on: HomeOn, off: HomeOff },
  community: { on: CommunityOn, off: CommunityOff },
  notifications: { on: AlertOn, off: AlertOff },
  profile: { on: MypageOn, off: MypageOff },
};

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 28,
        left: 24,
        right: 24,
        height: 64,
        backgroundColor: isDark ? '#4C5252' : '#ffffff',
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        ...Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
          },
          android: {
            elevation: 16,
          },
        }),
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const icons = TAB_ICONS[route.name];
        const Icon = isFocused ? icons?.on : icons?.off;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <IconButton
            key={route.key}
            variant="ghost"
            active={isFocused}
            onClick={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            icon={Icon ? <Icon width={24} height={24} /> : null}
          />
        );
      })}
    </View>
  );
}
