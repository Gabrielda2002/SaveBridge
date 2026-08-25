import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { colors, radii, spacing } from '../theme/tokens';

interface HomeScreenProps {
  connectionState: string;
  onOpenSettings: () => void;
  onSync: () => void;
}

export function HomeScreen({ connectionState, onOpenSettings, onSync }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LOCAL GAME SAVES</Text>
          <Text style={styles.title}>SaveBridge</Text>
        </View>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
        >
          <Ionicons color={colors.accent} name="settings-outline" size={22} />
        </Pressable>
      </View>

      <View style={styles.heroSection}>
        <SectionLabel>QUICK SYNC</SectionLabel>
        <Text style={styles.heroTitle}>Your saves, wherever you play.</Text>
        <Text style={styles.heroCopy}>
          Compare and move your latest save between Android and your PC.
        </Text>
        <Button title="Sync with PC" subtitle={connectionState} onPress={onSync} />
      </View>

      <View style={styles.sectionHeader}>
        <SectionLabel>RECENT ACTIVITY</SectionLabel>
        <Text style={styles.mutedText}>View all</Text>
      </View>

      <Card>
        <View style={styles.activityCard}>
          <View style={styles.gameMark}>
            <Text style={styles.gameMarkText}>DS</Text>
          </View>
          <View style={styles.activityDetails}>
            <Text style={styles.gameTitle}>No saves synced yet</Text>
            <Text style={styles.activityMeta}>Your recent activity will appear here</Text>
          </View>
          <Text style={styles.activityArrow}>...</Text>
        </View>
      </Card>

      <View style={styles.tipCard}>
        <Text style={styles.tipLabel}>TIP</Text>
        <Text style={styles.tipText}>Close the emulator before syncing to ensure the save is complete.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  settingsButtonPressed: {
    backgroundColor: colors.borderStrong,
  },
  heroSection: {
    marginBottom: 38,
    marginTop: spacing.xxl,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 39,
    marginBottom: 12,
    marginTop: 12,
  },
  heroCopy: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 320,
    marginBottom: 26,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  mutedText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  activityCard: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  gameMark: {
    alignItems: 'center',
    backgroundColor: '#222A3A',
    borderRadius: radii.sm,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  gameMarkText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  activityDetails: {
    flex: 1,
    marginLeft: 13,
  },
  gameTitle: {
    color: '#DDE2EC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  activityMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  activityArrow: {
    color: colors.textMuted,
    fontSize: 16,
    letterSpacing: 2,
  },
  tipCard: {
    borderLeftColor: colors.accent,
    borderLeftWidth: 2,
    marginTop: 28,
    paddingLeft: spacing.md,
  },
  tipLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
