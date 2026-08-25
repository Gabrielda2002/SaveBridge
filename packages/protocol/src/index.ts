export type DevicePlatform = 'android' | 'windows';

export type SaveDirection = 'android-to-windows' | 'windows-to-android';

export interface SaveFileDescriptor {
  gameId: string;
  fileName: string;
  size: number;
  modifiedAt: string;
  sha256: string;
}

export interface AgentHealthResponse {
  service: 'savebridge-agent';
  version: string;
  platform: 'windows';
  status: 'ok';
}

export interface GameSaveDescriptor {
  gameId: string;
  saveFileName: string;
  savePath: string;
  size: number;
  modifiedAt: string;
}

export interface GameListResponse {
  gamesRoot: string;
  saves: GameSaveDescriptor[];
}

export interface ConfigureGamesFolderRequest {
  gamesRoot: string;
}

export interface ConfigureGamesFolderResponse {
  gamesRoot: string;
  status: 'configured';
}

export interface PairingPayload {
  address: string;
  token: string;
}
