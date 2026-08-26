import { StyleSheet, Text, View } from 'react-native';

import type { SaveComparisonStatus } from '@savebridge/protocol';

import { colors, radii, spacing } from '../theme/tokens';

const STATUS_LABELS: Record<SaveComparisonStatus, string> = {
  same: 'Same',
  conflict: 'You decide',
  missing: 'Missing',
};

const STATUS_COLORS: Record<SaveComparisonStatus, string> = {
  same: colors.success,
  conflict: colors.danger,
  missing: colors.textMuted,
};

interface SaveStatusBadgeProps {
  status: SaveComparisonStatus;
}

export function SaveStatusBadge({ status }: SaveStatusBadgeProps) {
  const color = STATUS_COLORS[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: `${color}55` }]}>
      <Text style={[styles.label, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
