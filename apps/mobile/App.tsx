import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors, spacing } from './src/theme/tokens';

type Screen = 'home' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [pcAddress, setPcAddress] = useState('http://192.168.20.26:45821');
  const [connectionState, setConnectionState] = useState('Not checked');

  async function checkConnection() {
    setConnectionState('Checking...');

    try {
      const response = await fetch(`${pcAddress.replace(/\/$/, '')}/health`);
      if (!response.ok) {
        throw new Error('Agent returned an error');
      }

      setConnectionState('Connection verified');
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
              onOpenSettings={() => setScreen('settings')}
              onSync={checkConnection}
            />
          ) : (
            <SettingsScreen
              address={pcAddress}
              connectionState={connectionState}
              onAddressChange={setPcAddress}
              onBack={() => setScreen('home')}
              onCheckConnection={checkConnection}
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
