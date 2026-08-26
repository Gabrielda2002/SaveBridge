import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type {
  CompareSavesResponse,
  GameComparison,
  GameListResponse,
  SaveDirection,
} from '@savebridge/protocol';
import type { PairingPayload } from '@savebridge/protocol';

import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors, spacing } from './src/theme/tokens';
import { scanAndroidSaves } from './src/utils/androidScanner';
import {
  downloadWindowsSave,
  uploadAndroidSave,
  writeAndroidSaveWithBackup,
} from './src/utils/saveTransfer';

type Screen = 'home' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [pcAddress, setPcAddress] = useState('http://192.168.20.26:45821');
  const [gamesFolder, setGamesFolder] = useState('C:\\Users\\PROGRAMACION\\Documents\\Emulaciones\\games\\nds');
  const [pairingToken, setPairingToken] = useState('');
  const [connectionState, setConnectionState] = useState('Not checked');
  const [comparisons, setComparisons] = useState<GameComparison[]>([]);
  const [androidPath, setAndroidPath] = useState<string | null>(null);
  const [transferringGameId, setTransferringGameId] = useState<string | null>(null);

  function handleAndroidPathChange(path: string | null) {
    setAndroidPath(path);
  }

  async function handleTransfer(game: GameComparison, direction: SaveDirection) {
    if (!androidPath || transferringGameId) {
      return;
    }

    setTransferringGameId(game.gameId);
    try {
      const baseUrl = pcAddress.replace(/\/$/, '');

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
        await writeAndroidSaveWithBackup(androidPath, downloaded.saveFileName, downloaded.contentBase64);
      }

      await checkConnection();
    } catch {
      setConnectionState('Transfer failed');
    } finally {
      setTransferringGameId(null);
    }
  }

  async function checkConnection() {
    setConnectionState('Checking...');

    try {
      const response = await fetch(`${pcAddress.replace(/\/$/, '')}/health`);
      if (!response.ok) {
        throw new Error('Agent returned an error');
      }

      const baseUrl = pcAddress.replace(/\/$/, '');
      const configResponse = await fetch(`${baseUrl}/config/games-folder`, {
        body: JSON.stringify({ gamesRoot: gamesFolder }),
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
    } catch {
      setConnectionState('Could not reach PC');
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.content}>
          {screen === 'home' ? (
            <HomeScreen
              connectionState={connectionState}
              comparisons={comparisons}
              transferringGameId={transferringGameId}
              onOpenSettings={() => setScreen('settings')}
              onSync={checkConnection}
              onTransfer={handleTransfer}
            />
          ) : (
            <SettingsScreen
              address={pcAddress}
              pairingToken={pairingToken}
              connectionState={connectionState}
              onAddressChange={setPcAddress}
              onBack={() => setScreen('home')}
              onCheckConnection={checkConnection}
              onPairingTokenChange={setPairingToken}
              onPaired={({ address, token }: PairingPayload) => {
                setPcAddress(address);
                setPairingToken(token);
                setConnectionState('QR scanned, ready to test');
              }}
              onPcPathChange={setGamesFolder}
              onAndroidPathChange={handleAndroidPathChange}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
});
