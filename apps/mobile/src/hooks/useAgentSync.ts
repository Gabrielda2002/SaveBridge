import { useState } from 'react';

import type {
  CompareSavesResponse,
  GameComparison,
  GameListResponse,
  PairingPayload,
  SaveDirection,
} from '@savebridge/protocol';

import { scanAndroidSaves } from '../utils/androidScanner';
import {
  downloadWindowsSave,
  uploadAndroidSave,
  writeAndroidSaveWithBackup,
} from '../utils/saveTransfer';

interface UseAgentSyncOptions {
  pcPath: string;
  androidPath: string | null;
}

export function useAgentSync({ pcPath, androidPath }: UseAgentSyncOptions) {
  const [pcAddress, setPcAddress] = useState('http://192.168.20.26:45821');
  const [pairingToken, setPairingToken] = useState('');
  const [connectionState, setConnectionState] = useState('Not checked');
  const [comparisons, setComparisons] = useState<GameComparison[]>([]);
  const [transferringGameId, setTransferringGameId] = useState<string | null>(null);

  const baseUrl = pcAddress.replace(/\/$/, '');

  function handlePaired({ address, token }: PairingPayload) {
    setPcAddress(address);
    setPairingToken(token);
    setConnectionState('QR scanned, ready to test');
  }

  async function checkConnection() {
    setConnectionState('Checking...');

    try {
      const response = await fetch(`${baseUrl}/health`);
      if (!response.ok) {
        throw new Error('Agent returned an error');
      }

      const configResponse = await fetch(`${baseUrl}/config/games-folder`, {
        body: JSON.stringify({ gamesRoot: pcPath }),
        headers: {
          'Content-Type': 'application/json',
          'x-savebridge-token': pairingToken,
        },
        method: 'POST',
      });
      if (!configResponse.ok) {
        throw new Error('PC folder configuration failed');
      }

      const gamesResponse = await fetch(`${baseUrl}/games`, {
        headers: { 'x-savebridge-token': pairingToken },
      });
      if (!gamesResponse.ok) {
        throw new Error('Games folder could not be read');
      }

      const gameList = (await gamesResponse.json()) as GameListResponse;

      let nextComparisons: GameComparison[] = [];
      if (androidPath) {
        const { saves } = await scanAndroidSaves(androidPath);
        const compareResponse = await fetch(`${baseUrl}/compare`, {
          body: JSON.stringify({ androidSaves: saves }),
          headers: {
            'Content-Type': 'application/json',
            'x-savebridge-token': pairingToken,
          },
          method: 'POST',
        });
        if (compareResponse.ok) {
          const compareResult = (await compareResponse.json()) as CompareSavesResponse;
          nextComparisons = compareResult.games;
        }
      }

      setComparisons(nextComparisons);
      setConnectionState(`${gameList.saves.length} save(s) found on PC`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[useAgentSync] checkConnection failed', error);
      setConnectionState(`Could not reach PC: ${message}`);
    }
  }

  async function handleTransfer(game: GameComparison, direction: SaveDirection) {
    if (!androidPath || transferringGameId) {
      return;
    }

    setTransferringGameId(game.gameId);
    try {
      if (direction === 'android-to-windows') {
        const androidSave = game.android;
        if (!androidSave) {
          throw new Error('Android save not found');
        }
        await uploadAndroidSave(
          baseUrl,
          pairingToken,
          androidSave.savePath,
          game.windows?.savePath ?? androidSave.saveFileName,
        );
      } else {
        const windowsSave = game.windows;
        if (!windowsSave) {
          throw new Error('PC save not found');
        }
        const downloaded = await downloadWindowsSave(baseUrl, pairingToken, windowsSave.savePath);
        await writeAndroidSaveWithBackup(
          androidPath,
          downloaded.saveFileName,
          downloaded.contentBase64,
          game.android?.savePath ?? null,
        );
      }

      await checkConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[useAgentSync] transfer failed', error);
      setConnectionState(`Transfer failed: ${message}`);
    } finally {
      setTransferringGameId(null);
    }
  }

  return {
    pcAddress,
    pairingToken,
    connectionState,
    comparisons,
    transferringGameId,
    handlePaired,
    checkConnection,
    handleTransfer,
    setPcAddress,
    setPairingToken,
  };
}