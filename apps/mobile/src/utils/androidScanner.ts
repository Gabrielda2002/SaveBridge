import { Directory, File } from 'expo-file-system';
import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import type { GameSaveDescriptor } from '@savebridge/protocol';

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface AndroidScanResult {
  saves: GameSaveDescriptor[];
}

export async function scanAndroidSaves(directoryUri: string): Promise<AndroidScanResult> {
  const directory = new Directory(directoryUri);
  const entries = directory.list();
  const saveFiles = entries.filter(
    (entry): entry is File => entry instanceof File && entry.name.toLowerCase().endsWith('.sav'),
  );

  const saves: GameSaveDescriptor[] = [];

  for (const file of saveFiles) {
    try {
      if (file.size === 0) {
        continue;
      }

      const digestBuffer = await digest(CryptoDigestAlgorithm.SHA256, await file.bytes());
      saves.push({
        gameId: file.name,
        saveFileName: file.name,
        savePath: file.uri,
        size: file.size,
        modifiedAt: new Date(file.lastModified ?? 0).toISOString(),
        sha256: toHex(digestBuffer),
      });
    } catch {
      // A single unreadable save should not block the whole scan.
    }
  }

  return { saves };
}
