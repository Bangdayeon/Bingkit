import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View } from 'react-native';
import { Text } from '@/components/Text';

const SIZE = 72;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface DonutStatProps {
  label: string;
  current: number;
  total: number;
  /** true이면 current > total 시 빨간색으로 표시 */
  overflowRed?: boolean;
}

export function DonutStat({ label, current, total, overflowRed }: DonutStatProps) {
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;
  const isOver = overflowRed && current > total;
  const filled = CIRCUMFERENCE * ratio;

  return (
    <View className="items-center gap-1">
      <Text className="text-label-sm">{label}</Text>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Defs>
            <LinearGradient id="donutGrad" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor="#8EF275" />
              <Stop offset="1" stopColor="#54DBED" />
            </LinearGradient>
          </Defs>

          {/* 배경 트랙 */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#E5E7EB" /* gray-200 */
            strokeWidth={STROKE}
          />

          {/* 채워진 호 */}
          {filled > 0 && (
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={isOver ? '#EF4444' /* red-500 */ : 'url(#donutGrad)'}
              strokeWidth={STROKE}
              strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
              strokeDashoffset={CIRCUMFERENCE / 4} /* 12시 방향 시작 */
              strokeLinecap="round"
            />
          )}
        </Svg>

        {/* 중앙 텍스트 */}
        <View
          style={{
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="text-caption-sm" style={{ color: isOver ? '#EF4444' : undefined }}>
            {current}/{total}
          </Text>
        </View>
      </View>
    </View>
  );
}
