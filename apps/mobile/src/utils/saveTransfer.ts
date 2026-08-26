import { Directory, File } from 'expo-file-system';

import type { SaveDownloadResponse, SaveUploadRequest, SaveUploadResponse } from '@savebridge/protocol';

function timestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}

export async function uploadAndroidSave(
  baseUrl: string,
  token: string,
  androidSavePath: string,
  targetPath: string,
): Promise<SaveUploadResponse> {
  const source = new File(androidSavePath);
  const contentBase64 = await source.base64();

  const requestBody: SaveUploadRequest = {
    saveFileName: source.name,
    targetPath,
    contentBase64,
  };

  const response = await fetch(`${baseUrl}/save/upload`, {
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'x-savebridge-token': token,
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Upload to PC failed');
  }

  return (await response.json()) as SaveUploadResponse;
}

export async function downloadWindowsSave(
  baseUrl: string,
  token: string,
  savePath: string,
): Promise<SaveDownloadResponse> {
  const response = await fetch(`${baseUrl}/save/download?savePath=${encodeURIComponent(savePath)}`, {
    headers: { 'x-savebridge-token': token },
  });

  if (!response.ok) {
    throw new Error('Download from PC failed');
  }

  return (await response.json()) as SaveDownloadResponse;
}

export async function writeAndroidSaveWithBackup(
  directoryUri: string,
  saveFileName: string,
  contentBase64: string,
): Promise<string | null> {
  const directory = new Directory(directoryUri);
  const target = new File(directory, saveFileName);

  let backupPath: string | null = null;
  if (target.exists) {
    const backupsDirectory = new Directory(directory, 'backups');
    if (!backupsDirectory.exists) {
      backupsDirectory.create();
    }
    const extension = saveFileName.slice(saveFileName.lastIndexOf('.'));
    const baseName = saveFileName.slice(0, saveFileName.lastIndexOf('.'));
    const backup = new File(backupsDirectory, `${baseName}-${timestamp()}${extension}`);
    target.copy(backup);
    backupPath = backup.uri;
  }

  target.write(contentBase64, { encoding: 'base64' });
  return backupPath;
}