import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';

import type { SaveDownloadResponse, SaveUploadRequest, SaveUploadResponse } from '@savebridge/protocol';

function timestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}

function backupFileName(saveFileName: string): string {
  const extension = extname(saveFileName);
  const base = basename(saveFileName, extension);
  return `${base}-${timestamp()}${extension}`;
}

function resolveInside(gamesRoot: string, relativePath: string): string {
  const root = resolve(gamesRoot);
  const target = resolve(root, relativePath);
  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error('Save path escapes the games folder');
  }
  return target;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function uploadSave(
  gamesRoot: string,
  request: SaveUploadRequest,
): Promise<SaveUploadResponse> {
  const destination = resolveInside(gamesRoot, request.targetPath);

  let backupPath: string | null = null;
  if (await exists(destination)) {
    const backupsDirectory = join(dirname(destination), 'backups');
    await mkdir(backupsDirectory, { recursive: true });
    const backup = join(backupsDirectory, backupFileName(request.saveFileName));
    await copyFile(destination, backup);
    backupPath = relative(gamesRoot, backup).split(sep).join('/');
  }

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(request.contentBase64, 'base64'));

  return {
    saveFileName: request.saveFileName,
    savedPath: relative(gamesRoot, destination).split(sep).join('/'),
    backupPath,
  };
}

export async function downloadSave(
  gamesRoot: string,
  relativePath: string,
): Promise<SaveDownloadResponse> {
  const source = resolveInside(gamesRoot, relativePath);
  const fileContents = await readFile(source);

  return {
    saveFileName: basename(source),
    contentBase64: fileContents.toString('base64'),
    size: fileContents.length,
  };
}