import AsyncStorage from '@react-native-async-storage/async-storage';

const ORDER_KEY = '@bingket/bingo-order';

export async function saveBingoOrder(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(ORDER_KEY, JSON.stringify(ids));
}

export async function loadBingoOrder(): Promise<string[] | null> {
  const raw = await AsyncStorage.getItem(ORDER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as string[];
}

export function applyBingoOrder<T extends { id: string }>(
  items: T[],
  savedOrder: string[] | null,
): T[] {
  if (!savedOrder || savedOrder.length === 0) return items;
  const map = new Map(items.map((item) => [item.id, item]));
  const ordered = savedOrder.flatMap((id) => (map.has(id) ? [map.get(id)!] : []));
  const rest = items.filter((item) => !savedOrder.includes(item.id));
  return [...ordered, ...rest];
}
