import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GameComparison, SaveDirection } from '@savebridge/protocol';

import { SaveStatusBadge } from '../components/SaveStatusBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { colors, radii, spacing } from '../theme/tokens';

interface HomeScreenProps {
  connectionState: string;
  comparisons: GameComparison[];
  transferringGameId: string | null;
  onOpenSettings: () => void;
  onSync: () => void;
  onTransfer: (game: GameComparison, direction: SaveDirection) => void;
}

function summarizeComparisons(games: GameComparison[]): string {
  const onBoth = games.filter((game) => game.presentOn === 'both').length;
  const onAndroid = games.filter((game) => game.presentOn === 'android').length;
  const onWindows = games.filter((game) => game.presentOn === 'windows').length;
  const conflicts = games.filter((game) => game.status === 'conflict').length;

  const parts: string[] = [];
  if (onBoth) {
    parts.push(`${onBoth} on both`);
  }
  if (onAndroid) {
    parts.push(`${onAndroid} Android only`);
  }
  if (onWindows) {
    parts.push(`${onWindows} PC only`);
  }
  if (conflicts) {
    parts.push(`${conflicts} need(s) decision`);
  }
  return parts.join(' · ');
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function describeDevices(game: GameComparison): string {
  if (game.presentOn === 'both') {
    return `Android: ${formatDate(game.android?.modifiedAt)} · PC: ${formatDate(game.windows?.modifiedAt)}`;
  }
  if (game.presentOn === 'android') {
    return `Android: ${formatDate(game.android?.modifiedAt)}`;
  }
  return `PC: ${formatDate(game.windows?.modifiedAt)}`;
}

function transferActions(game: GameComparison): SaveDirection[] {
  if (game.status === 'same') {
    return [];
  }
  if (game.presentOn === 'android') {
    return ['android-to-windows'];
  }
  if (game.presentOn === 'windows') {
    return ['windows-to-android'];
  }
  return ['android-to-windows', 'windows-to-android'];
}

export function HomeScreen({
  connectionState,
  comparisons,
  transferringGameId,
  onOpenSettings,
  onSync,
  onTransfer,
}: HomeScreenProps) {
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
            <Text style={styles.gameTitle}>
              {comparisons.length
                ? `${comparisons.length} save(s) compared`
                : 'No saves compared yet'}
            </Text>
            <Text style={styles.activityMeta}>
              {comparisons.length
                ? summarizeComparisons(comparisons)
                : 'Test the PC connection to scan both folders'}
            </Text>
          </View>
          <Text style={styles.activityArrow}>...</Text>
        </View>

        {comparisons.length ? (
          <View style={styles.gameList}>
            {comparisons.map((game) => {
              const actions = transferActions(game);
              const isTransferring = transferringGameId === game.gameId;
              return (
                <View key={game.gameId} style={styles.gameRow}>
                  <View style={styles.gameInfo}>
                    <Text numberOfLines={1} style={styles.gameName}>
                      {game.gameId}
                    </Text>
                    <Text numberOfLines={1} style={styles.gameDevices}>
                      {describeDevices(game)}
                    </Text>
                    {actions.length ? (
                      <View style={styles.transferActions}>
                        {actions.map((direction) => (
                          <Pressable
                            accessibilityRole="button"
                            disabled={isTransferring}
                            key={direction}
                            onPress={() => onTransfer(game, direction)}
                            style={({ pressed }) => [
                              styles.transferButton,
                              pressed && styles.transferButtonPressed,
                            ]}
                          >
                            <Text style={styles.transferButtonText}>
                              {isTransferring
                                ? 'Transferring...'
                                : direction === 'android-to-windows'
                                  ? 'Send to PC'
                                  : 'Get from PC'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <SaveStatusBadge status={game.status} />
                </View>
              );
            })}
          </View>
        ) : null}
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
  gameList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  gameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  gameInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  gameName: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  gameDevices: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  transferActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  transferButton: {
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  transferButtonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  transferButtonText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
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
