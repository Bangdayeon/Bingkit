import { Image, View } from 'react-native';
import ProfileLgSvg from '@/assets/default_profiles/profile_lg.svg';

export const DEFAULT_AVATAR_COLORS = [
  '#F79A6E', // peach400
  '#6ADE50', // green500
  '#C0B0F5', // lavender300
  '#EC5858', // red400
  '#F5E060', // yellow300
  '#54DBED', // sky400
] as const;

export const DEFAULT_AVATAR_PREFIX = 'default:';

export function randomDefaultAvatarUrl(): string {
  const color = DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)];
  return `${DEFAULT_AVATAR_PREFIX}${color}`;
}

interface ProfileAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
}

export function ProfileAvatar({ avatarUrl, size = 98 }: ProfileAvatarProps) {
  if (avatarUrl?.startsWith(DEFAULT_AVATAR_PREFIX)) {
    const color = avatarUrl.slice(DEFAULT_AVATAR_PREFIX.length);
    return <ProfileLgSvg width={size} height={size} color={color} />;
  }

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#D2D6D6' /* gray-300 */,
      }}
    />
  );
}
