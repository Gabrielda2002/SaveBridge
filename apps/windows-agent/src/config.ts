import { randomBytes, timingSafeEqual } from 'node:crypto';
import { homedir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { stat } from 'node:fs/promises';

const defaultGamesRoot = join(homedir(), 'Documents', 'Emulaciones', 'games', 'nds');

let gamesRoot = resolve(process.env.SAVE_BRIDGE_GAMES_DIR ?? defaultGamesRoot);
const token = process.env.SAVE_BRIDGE_TOKEN ?? randomBytes(24).toString('hex');

export function getGamesRoot() {
  return gamesRoot;
}

export function getPairingToken() {
  return token;
}

export function isAuthorized(receivedToken: string | undefined) {
  if (!receivedToken) {
    return false;
  }

  const expected = Buffer.from(token);
  const received = Buffer.from(receivedToken);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function configureGamesRoot(candidate: string) {
  if (!isAbsolute(candidate)) {
    throw new Error('Games folder must be an absolute path');
  }

  const candidateRoot = resolve(candidate);
  const rootStats = await stat(candidateRoot);
  if (!rootStats.isDirectory()) {
    throw new Error('Games folder must be a directory');
  }

  gamesRoot = candidateRoot;
  return gamesRoot;
}
