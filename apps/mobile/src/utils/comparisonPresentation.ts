import type { GameComparison, SaveDirection } from '@savebridge/protocol';

export function summarizeComparisons(games: GameComparison[]): string {
  const onBoth = games.filter((game) => game.presentOn === 'both').length;
  const onAndroid = games.filter((game) => game.presentOn === 'android').length;
  const onWindows = games.filter((game) => game.presentOn === 'windows').length;
  const conflicts = games.filter((game) => game.status === 'conflict').length;

  const parts: string[] = [];
  if (onBoth) {
    parts.push(`${onBoth} on both`);
  }
  if (onAndroid) {
    parts.push(`${onAndroid} Android only`);
  }
  if (onWindows) {
    parts.push(`${onWindows} PC only`);
  }
  if (conflicts) {
    parts.push(`${conflicts} need(s) decision`);
  }
  return parts.join(' · ');
}

export function formatDate(value: string | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function describeDevices(game: GameComparison): string {
  if (game.presentOn === 'both') {
    return `Android: ${formatDate(game.android?.modifiedAt)} · PC: ${formatDate(game.windows?.modifiedAt)}`;
  }
  if (game.presentOn === 'android') {
    return `Android: ${formatDate(game.android?.modifiedAt)}`;
  }
  return `PC: ${formatDate(game.windows?.modifiedAt)}`;
}

export function transferActions(game: GameComparison): SaveDirection[] {
  if (game.status === 'same') {
    return [];
  }
  if (game.presentOn === 'android') {
    return ['android-to-windows'];
  }
  if (game.presentOn === 'windows') {
    return ['windows-to-android'];
  }
  return ['android-to-windows', 'windows-to-android'];
}