import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';

const defaultGamesRoot = join(homedir(), 'Documents', 'Emulaciones', 'games', 'nds');

interface AgentSettings {
  token: string;
  gamesRoot: string;
}

function defaultConfigPath(): string {
  const base = process.env.APPDATA;
  return base
    ? join(base, 'SaveBridge', 'config.json')
    : join(homedir(), '.savebridge', 'config.json');
}

function readConfigFile(path: string): Promise<Partial<AgentSettings>> {
  return readFile(path, 'utf8')
    .then((raw) => {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Partial<AgentSettings>;
      }
      return {};
    })
    .catch(() => ({}));
}

let settings: AgentSettings | null = null;
let configPath = defaultConfigPath();

function current(): AgentSettings {
  if (!settings) {
    throw new Error('SaveBridge config is not initialized; call initConfig() before use');
  }
  return settings;
}

async function persist(): Promise<void> {
  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(current(), null, 2), 'utf8');
}

export async function initConfig(overridePath?: string): Promise<AgentSettings> {
  configPath = overridePath ?? defaultConfigPath();
  const stored = await readConfigFile(configPath);

  const token = process.env.SAVE_BRIDGE_TOKEN ?? stored.token ?? randomBytes(24).toString('hex');
  const gamesRoot = resolve(process.env.SAVE_BRIDGE_GAMES_DIR ?? stored.gamesRoot ?? defaultGamesRoot);

  settings = { token, gamesRoot };
  await persist();
  return settings;
}

export function getGamesRoot(): string {
  return current().gamesRoot;
}

export function getConfigPath(): string {
  return configPath;
}

export function getPairingToken(): string {
  return current().token;
}

export function isAuthorized(receivedToken: string | undefined): boolean {
  if (!receivedToken) {
    return false;
  }

  const expected = Buffer.from(current().token);
  const received = Buffer.from(receivedToken);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function configureGamesRoot(candidate: string): Promise<string> {
  if (!isAbsolute(candidate)) {
    throw new Error('Games folder must be an absolute path');
  }

  const candidateRoot = resolve(candidate);
  const rootStats = await stat(candidateRoot);
  if (!rootStats.isDirectory()) {
    throw new Error('Games folder must be a directory');
  }

  settings = { ...current(), gamesRoot: candidateRoot };
  await persist();
  return candidateRoot;
}
