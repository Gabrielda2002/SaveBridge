import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '../ui/Card';
import { SectionLabel } from '../ui/SectionLabel';
import { colors, radii, spacing } from '../../theme/tokens';
import { useFolderSettings } from './useFolderSettings';

export function FolderSettings() {
  const { androidPath, pcPath, selectAndroidFolder, setPcPath } = useFolderSettings();

  return (
    <Card>
      <View style={styles.container}>
        <SectionLabel>SAVE FOLDERS</SectionLabel>
        <Text style={styles.description}>
          Tell SaveBridge where each emulator stores its save files.
        </Text>

        <Text style={styles.fieldLabel}>WINDOWS FOLDER</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          onChangeText={setPcPath}
          placeholder="C:\\path\\to\\nds"
          placeholderTextColor={colors.textMuted}
          style={styles.pathInput}
          value={pcPath}
        />

        <Text style={styles.fieldLabel}>ANDROID FOLDER</Text>
        <Pressable
          accessibilityRole="button"
          onPress={selectAndroidFolder}
          style={({ pressed }) => [styles.folderButton, pressed && styles.folderButtonPressed]}
        >
          <Text style={styles.folderButtonText}>
            {androidPath ? 'Change Android folder' : 'Choose Android folder'}
          </Text>
        </Pressable>
        <Text numberOfLines={2} style={styles.selectedPath}>
          {androidPath ?? 'No Android folder selected'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: spacing.sm,
  },
  pathInput: {
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 13,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  folderButton: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingVertical: 12,
  },
  folderButtonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  folderButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedPath: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
});
