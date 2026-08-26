import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameComparison, SaveDirection } from '@savebridge/protocol';

import { SaveStatusBadge } from './SaveStatusBadge';
import { colors, radii, spacing } from '../theme/tokens';
import { describeDevices, transferActions } from '../utils/comparisonPresentation';

interface GameRowProps {
  game: GameComparison;
  isTransferring: boolean;
  onTransfer: (game: GameComparison, direction: SaveDirection) => void;
}

export function GameRow({ game, isTransferring, onTransfer }: GameRowProps) {
  const actions = transferActions(game);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {game.gameId}
        </Text>
        <Text numberOfLines={1} style={styles.devices}>
          {describeDevices(game)}
        </Text>
        {actions.length ? (
          <View style={styles.actions}>
            {actions.map((direction) => (
              <Pressable
                accessibilityRole="button"
                disabled={isTransferring}
                key={direction}
                onPress={() => onTransfer(game, direction)}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <Text style={styles.buttonText}>
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
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  devices: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  button: {
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  buttonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  buttonText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
});