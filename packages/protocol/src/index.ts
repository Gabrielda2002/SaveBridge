export type DevicePlatform = 'android' | 'windows';

export type SaveDirection = 'android-to-windows' | 'windows-to-android';

export type SaveComparisonStatus = 'same' | 'conflict' | 'missing';

export type SaveComparisonSide = 'android' | 'windows' | 'both';

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
  sha256: string;
}

export interface GameComparison {
  gameId: string;
  presentOn: SaveComparisonSide;
  status: SaveComparisonStatus;
  android: GameSaveDescriptor | null;
  windows: GameSaveDescriptor | null;
}

export interface CompareSavesRequest {
  androidSaves: GameSaveDescriptor[];
}

export interface CompareSavesResponse {
  games: GameComparison[];
}

export interface SaveUploadRequest {
  saveFileName: string;
  targetPath: string;
  contentBase64: string;
}

export interface SaveUploadResponse {
  saveFileName: string;
  savedPath: string;
  backupPath: string | null;
}

export interface SaveDownloadResponse {
  saveFileName: string;
  contentBase64: string;
  size: number;
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
