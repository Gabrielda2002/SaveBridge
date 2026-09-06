import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

import {
  configureGamesRoot,
  getConfigPath,
  getGamesRoot,
  getPairingToken,
  initConfig,
  isAuthorized,
} from '../src/config.js';

async function tempRoot(): Promise<{ root: string; path: string }> {
  const root = await mkdtemp(join(tmpdir(), 'savebridge-config-'));
  return { root, path: join(root, 'SaveBridge', 'config.json') };
}

async function withoutEnv(run: () => Promise<void>): Promise<void> {
  const savedToken = process.env.SAVE_BRIDGE_TOKEN;
  const savedGames = process.env.SAVE_BRIDGE_GAMES_DIR;
  delete process.env.SAVE_BRIDGE_TOKEN;
  delete process.env.SAVE_BRIDGE_GAMES_DIR;
  try {
    await run();
  } finally {
    if (savedToken !== undefined) {
      process.env.SAVE_BRIDGE_TOKEN = savedToken;
    }
    if (savedGames !== undefined) {
      process.env.SAVE_BRIDGE_GAMES_DIR = savedGames;
    }
  }
}

test('generates and persists a pairing token that survives restarts', async () => {
  const { root, path } = await tempRoot();

  try {
    await withoutEnv(async () => {
      const first = await initConfig(path);
      assert.match(first.token, /^[a-f0-9]{48}$/);
      assert.equal(getConfigPath(), path);

      const saved = JSON.parse(await readFile(path, 'utf8')) as { token: string };
      assert.equal(saved.token, first.token);

      const second = await initConfig(path);
      assert.equal(second.token, first.token);
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('an environment-provided token becomes the saved one', async () => {
  const { root, path } = await tempRoot();

  try {
    const token = 'a'.repeat(32);
    process.env.SAVE_BRIDGE_TOKEN = token;
    try {
      await initConfig(path);
    } finally {
      delete process.env.SAVE_BRIDGE_TOKEN;
    }

    await withoutEnv(async () => {
      const saved = JSON.parse(await readFile(path, 'utf8')) as { token: string };
      assert.equal(saved.token, token);

      await initConfig(path);
      assert.equal(getPairingToken(), token);
      assert.ok(isAuthorized(token));
      assert.ok(!isAuthorized('b'.repeat(32)));
      assert.ok(!isAuthorized('short-token'));
      assert.ok(!isAuthorized(undefined));
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('configureGamesRoot persists the folder for future launches', async () => {
  const { root, path } = await tempRoot();
  const gamesDir = await mkdtemp(join(tmpdir(), 'savebridge-games-'));

  try {
    await withoutEnv(async () => {
      await initConfig(path);

      const configured = await configureGamesRoot(gamesDir);
      assert.equal(configured, resolve(gamesDir));

      const restarted = await initConfig(path);
      assert.equal(restarted.gamesRoot, resolve(gamesDir));
      assert.equal(getGamesRoot(), resolve(gamesDir));
    });
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(gamesDir, { recursive: true, force: true });
  }
});

test('a corrupt config file is replaced instead of crashing the agent', async () => {
  const { root, path } = await tempRoot();

  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, 'this is not valid json', 'utf8');

    await withoutEnv(async () => {
      const config = await initConfig(path);
      assert.match(config.token, /^[a-f0-9]{48}$/);
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
