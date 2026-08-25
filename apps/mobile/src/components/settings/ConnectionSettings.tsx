import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '../ui/Card';
import { SectionLabel } from '../ui/SectionLabel';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, radii, spacing } from '../../theme/tokens';

interface ConnectionSettingsProps {
  address: string;
  state: string;
  onAddressChange: (address: string) => void;
  onCheckConnection: () => void;
}

export function ConnectionSettings({
  address,
  state,
  onAddressChange,
  onCheckConnection,
}: ConnectionSettingsProps) {
  return (
    <Card>
      <View style={styles.container}>
        <StatusBadge label="PC CONNECTION" />
        <Text style={styles.title}>Windows gaming PC</Text>
        <Text style={styles.description}>Enter the local address of the SaveBridge agent.</Text>
        <Text style={styles.fieldLabel}>LOCAL ADDRESS</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onChangeText={onAddressChange}
          placeholder="http://192.168.x.x:45821"
          placeholderTextColor={colors.textMuted}
          style={styles.addressInput}
          value={address}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onCheckConnection}
          style={({ pressed }) => [styles.testButton, pressed && styles.testButtonPressed]}
        >
          <Text style={styles.testButtonText}>Test connection</Text>
        </Pressable>
        <Text style={styles.state}>{state}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
    marginTop: spacing.md,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: spacing.sm,
  },
  addressInput: {
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  testButton: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingVertical: 11,
  },
  testButtonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  testButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  state: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
