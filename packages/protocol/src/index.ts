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
