import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PairingPayload } from '@savebridge/protocol';

import { ConnectionSettings } from '../components/settings/ConnectionSettings';
import { FolderSettings } from '../components/settings/FolderSettings';
import { SectionLabel } from '../components/ui/SectionLabel';
import { colors, spacing } from '../theme/tokens';

interface SettingsScreenProps {
  address: string;
  pairingToken: string;
  connectionState: string;
  onAddressChange: (address: string) => void;
  onAndroidPathChange: (path: string | null) => void;
  onBack: () => void;
  onCheckConnection: () => void;
  onPairingTokenChange: (token: string) => void;
  onPaired: (payload: PairingPayload) => void;
  onPcPathChange: (path: string) => void;
}

export function SettingsScreen({
  address,
  pairingToken,
  connectionState,
  onAddressChange,
  onAndroidPathChange,
  onBack,
  onCheckConnection,
  onPairingTokenChange,
  onPaired,
  onPcPathChange,
}: SettingsScreenProps) {
  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>&lt;-</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Text style={styles.description}>Configure the devices and folders SaveBridge will use.</Text>

      <View style={styles.section}>
        <SectionLabel>CONNECTION</SectionLabel>
        <ConnectionSettings
          address={address}
          pairingToken={pairingToken}
          onAddressChange={onAddressChange}
          onCheckConnection={onCheckConnection}
          onPairingTokenChange={onPairingTokenChange}
          onPaired={onPaired}
          state={connectionState}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel>FOLDERS</SectionLabel>
        <FolderSettings onAndroidPathChange={onAndroidPathChange} onPcPathChange={onPcPathChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backArrow: {
    color: colors.accent,
    fontSize: 18,
    marginRight: spacing.xs,
  },
  backText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
});
