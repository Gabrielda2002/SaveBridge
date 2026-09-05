import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { downloadSave, uploadSave } from '../src/transfer.js';

async function temporaryRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'savebridge-test-'));
}

test('uploads a new save and downloads the same bytes', async () => {
  const root = await temporaryRoot();

  try {
    const content = Buffer.from('new save content');
    const upload = await uploadSave(root, {
      saveFileName: 'Platino.sav',
      targetPath: 'pokemon-platino/Platino.sav',
      contentBase64: content.toString('base64'),
    });

    assert.equal(upload.savedPath, 'pokemon-platino/Platino.sav');
    assert.equal(upload.backupPath, null);

    const download = await downloadSave(root, upload.savedPath);
    assert.equal(download.saveFileName, 'Platino.sav');
    assert.equal(download.size, content.length);
    assert.equal(Buffer.from(download.contentBase64, 'base64').toString(), content.toString());
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('backs up the previous save before overwriting it', async () => {
  const root = await temporaryRoot();
  const target = join(root, 'pokemon-platino', 'Platino.sav');

  try {
    await mkdir(join(root, 'pokemon-platino'), { recursive: true });
    await writeFile(target, 'old save content');
    const upload = await uploadSave(root, {
      saveFileName: 'Platino.sav',
      targetPath: 'pokemon-platino/Platino.sav',
      contentBase64: Buffer.from('new save content').toString('base64'),
    });

    assert.match(upload.backupPath ?? '', /^pokemon-platino\/backups\/Platino-\d{8}-\d{6}\.sav$/);
    assert.equal(await readFile(target, 'utf8'), 'new save content');
    assert.equal(await readFile(join(root, upload.backupPath ?? ''), 'utf8'), 'old save content');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects save paths that escape the configured games folder', async () => {
  const root = await temporaryRoot();

  try {
    await assert.rejects(
      uploadSave(root, {
        saveFileName: 'malicious.sav',
        targetPath: '../outside.sav',
        contentBase64: Buffer.from('should not be written').toString('base64'),
      }),
      { message: 'Save path escapes the games folder' },
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
