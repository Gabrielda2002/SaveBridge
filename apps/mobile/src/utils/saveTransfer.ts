import { Directory, File } from 'expo-file-system';

import type { SaveDownloadResponse, SaveUploadRequest, SaveUploadResponse } from '@savebridge/protocol';

function timestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}

function backupFileName(saveFileName: string): string {
  const extension = saveFileName.slice(saveFileName.lastIndexOf('.'));
  const baseName = saveFileName.slice(0, saveFileName.lastIndexOf('.'));
  return `${baseName}-${timestamp()}${extension}`;
}

async function readAgentError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body?.error) {
      return body.error;
    }
  } catch {
    // The agent might not return JSON on some failures.
  }
  return `HTTP ${response.status}`;
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
    throw new Error(`Upload to PC failed: ${await readAgentError(response)}`);
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
    throw new Error(`Download from PC failed: ${await readAgentError(response)}`);
  }

  return (await response.json()) as SaveDownloadResponse;
}

function findBackupsDirectory(rootDirectory: Directory): Directory | undefined {
  const directories = rootDirectory.list().filter((entry): entry is Directory => entry instanceof Directory);

  const exact = directories.find((entry) => entry.name === 'backups');

  if (exact) {
    return exact;
  }
  return directories.find((entry) => /^backups \(\d+\)$/.test(entry.name));
}

function findOrCreateBackupsDirectory(rootDirectory: Directory): Directory {
  const existing = findBackupsDirectory(rootDirectory);

  if (existing) {
    return existing;
  }

  const created = rootDirectory.createDirectory('backups');
  
  if (created.name === 'backups') {
    return created;
  }

  const original = findBackupsDirectory(rootDirectory);

  if (original) {
    created.delete();
    return original;
  }

  return created;
}

async function createAndroidBackup(target: File, rootDirectory: Directory): Promise<string> {
  const backupsDirectory = findOrCreateBackupsDirectory(rootDirectory);
  const backup = backupsDirectory.createFile(backupFileName(target.name), 'application/octet-stream');

  // Read + write through real document URIs: File.copy() has no advantages here
  // and base64()/write() are the primitives already proven to work over SAF.
  const contents = await target.base64();
  backup.write(contents, { encoding: 'base64' });
  return backup.uri;
}

export async function writeAndroidSaveWithBackup(
  directoryUri: string,
  saveFileName: string,
  contentBase64: string,
  existingSaveUri?: string | null,
): Promise<string | null> {
  const rootDirectory = new Directory(directoryUri);
  const target = existingSaveUri ? new File(existingSaveUri) : null;

  let backupPath: string | null = null;
  if (target) {
    if (!target.exists) {
      throw new Error(`Android save is not accessible before writing: ${existingSaveUri}`);
    }
    backupPath = await createAndroidBackup(target, rootDirectory);
    console.log('[saveTransfer] backup written:', backupPath);
  }

  // File.create() throws on content:// URIs: new documents must be created
  // through Directory.createFile(), which returns a real SAF document URI.
  const destination = target ?? rootDirectory.createFile(saveFileName, 'application/octet-stream');
  destination.write(contentBase64, { encoding: 'base64' });
  console.log('[saveTransfer] save written:', destination.uri);

  return backupPath;
}