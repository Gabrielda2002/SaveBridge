import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useAgentSync } from './src/hooks/useAgentSync';
import { useScreen } from './src/hooks/useScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors, spacing } from './src/theme/tokens';
import { useFolderSettings } from './src/components/settings/useFolderSettings';

export default function App() {
  const { screen, openHome, openSettings } = useScreen();
  const { androidPath, pcPath, selectAndroidFolder, setPcPath } = useFolderSettings();
  
  const {
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
  } = useAgentSync({ pcPath, androidPath });

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
              onOpenSettings={openSettings}
              onSync={checkConnection}
              onTransfer={handleTransfer}
            />
          ) : (
            <SettingsScreen
              address={pcAddress}
              pairingToken={pairingToken}
              connectionState={connectionState}
              onAddressChange={setPcAddress}
              onBack={openHome}
              onCheckConnection={checkConnection}
              onPairingTokenChange={setPairingToken}
              onPaired={handlePaired}
              pcPath={pcPath}
              androidPath={androidPath}
              onPcPathChange={setPcPath}
              onSelectAndroidFolder={selectAndroidFolder}
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