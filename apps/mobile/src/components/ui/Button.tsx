import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../theme/tokens';

interface ButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, subtitle, onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.arrow}>-&gt;</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  buttonPressed: {
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  title: {
    color: colors.accentDark,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.accentText,
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    color: colors.accentDark,
    fontSize: 24,
    fontWeight: '500',
  },
});
