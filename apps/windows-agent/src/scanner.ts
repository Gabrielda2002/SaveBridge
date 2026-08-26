import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

import type { GameSaveDescriptor } from '@savebridge/protocol';

export async function findSaves(gamesRoot: string): Promise<GameSaveDescriptor[]> {
  const entries = await readdir(gamesRoot, { withFileTypes: true });
  const saves: GameSaveDescriptor[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const gameDirectory = join(gamesRoot, entry.name);
    const gameFiles = await readdir(gameDirectory, { withFileTypes: true });
    const saveFile = gameFiles.find((file) => file.isFile() && file.name.toLowerCase().endsWith('.sav'));

    if (!saveFile) {
      continue;
    }

    const savePath = join(gameDirectory, saveFile.name);
    const fileStats = await stat(savePath);

    if (fileStats.size === 0) {
      continue;
    }

    const fileContents = await readFile(savePath);
    const sha256 = createHash('sha256').update(fileContents).digest('hex');
    saves.push({
      gameId: relative(gamesRoot, gameDirectory).split(sep).join('/'),
      saveFileName: saveFile.name,
      savePath: relative(gamesRoot, savePath).split(sep).join('/'),
      size: fileStats.size,
      modifiedAt: fileStats.mtime.toISOString(),
      sha256,
    });
  }

  return saves;
}
