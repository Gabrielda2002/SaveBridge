import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { GameListResponse } from '@savebridge/protocol';
import type { PairingPayload } from '@savebridge/protocol';

import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors, spacing } from './src/theme/tokens';

type Screen = 'home' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [pcAddress, setPcAddress] = useState('http://192.168.20.26:45821');
  const [gamesFolder, setGamesFolder] = useState('C:\\Users\\PROGRAMACION\\Documents\\Emulaciones\\games\\nds');
  const [pairingToken, setPairingToken] = useState('');
  const [connectionState, setConnectionState] = useState('Not checked');
  const [saveCount, setSaveCount] = useState(0);

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
      setSaveCount(gameList.saves.length);
      setConnectionState(`Connection verified · ${gameList.saves.length} save(s) found`);
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
              detectedSaves={saveCount}
              onOpenSettings={() => setScreen('settings')}
              onSync={checkConnection}
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
