import ProfileMd from '@/assets/profile_md.svg';
import ProfileSm from '@/assets/profile_sm.svg';

const ANONYMOUS_COLORS = [
  '#F79A6E', // peach-400
  '#54DBED', // sky-400
  '#6ADE50', // green-500
  '#EC5858', // red-400
  '#C0B0F5', // lavender-300
  '#F5E060', // yellow-300
] as const;

function getColor(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ANONYMOUS_COLORS[hash % ANONYMOUS_COLORS.length];
}

interface AnonymousProfileProps {
  seed: string;
  size: 'md' | 'sm';
}

export function AnonymousProfile({ seed, size }: AnonymousProfileProps) {
  const color = getColor(seed);

  return size === 'md' ? <ProfileMd color={color} /> : <ProfileSm color={color} />;
}
