import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/tokens';

interface StatusBadgeProps {
  label: string;
}

export function StatusBadge({ label }: StatusBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    backgroundColor: colors.success,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  label: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
