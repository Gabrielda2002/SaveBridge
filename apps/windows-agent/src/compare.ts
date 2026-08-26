import type {
  GameComparison,
  GameSaveDescriptor,
  SaveComparisonStatus,
} from '@savebridge/protocol';

function normalizeIdentity(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.sav$/i, '')
    .replace(/\s+/g, '_')
    .trim();
}

export function compareSaves(
  androidSaves: GameSaveDescriptor[],
  windowsSaves: GameSaveDescriptor[],
): GameComparison[] {
  const androidById = new Map(
    androidSaves.map((save) => [normalizeIdentity(save.saveFileName), save]),
  );
  const windowsById = new Map(
    windowsSaves.map((save) => [normalizeIdentity(save.saveFileName), save]),
  );

  const gameIds = new Set([...androidById.keys(), ...windowsById.keys()]);

  const games: GameComparison[] = [];

  for (const gameId of gameIds) {
    const android = androidById.get(gameId) ?? null;
    const windows = windowsById.get(gameId) ?? null;

    const status = resolveStatus(android, windows);
    const displayName = android?.saveFileName ?? windows?.saveFileName ?? gameId;

    games.push({
      gameId: displayName,
      presentOn: android && windows ? 'both' : android ? 'android' : 'windows',
      status,
      android,
      windows,
    });
  }

  return games.sort((a, b) => a.gameId.localeCompare(b.gameId));
}

function resolveStatus(
  android: GameSaveDescriptor | null,
  windows: GameSaveDescriptor | null,
): SaveComparisonStatus {
  if (!android || !windows) {
    return 'missing';
  }

  if (android.sha256 === windows.sha256) {
    return 'same';
  }

  return 'conflict';
}
