import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { PairingPayload } from '@savebridge/protocol';

import { colors, radii, spacing } from '../../theme/tokens';

interface QrPairingButtonProps {
  onPaired: (payload: PairingPayload) => void;
}

export function QrPairingButton({ onPaired }: QrPairingButtonProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  function handleScan(data: string) {
    try {
      const payload = JSON.parse(data) as PairingPayload;
      if (!payload.address || !payload.token) {
        throw new Error('Invalid QR payload');
      }
      onPaired(payload);
      setIsScanning(false);
    } catch {
      // Ignore unrelated QR codes and keep the scanner active.
    }
  }

  if (!isScanning) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsScanning(true)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Scan pairing QR</Text>
      </Pressable>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>Camera access is needed to scan the PC QR code.</Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.buttonText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.scanner}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => handleScan(data)}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.scannerOverlay}>
        <Text style={styles.scannerText}>Point the camera at the PC QR code</Text>
        <Pressable onPress={() => setIsScanning(false)} style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingVertical: 12,
  },
  buttonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  buttonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  permissionBox: {
    gap: spacing.md,
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  permissionButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.sm,
    paddingVertical: 12,
  },
  scanner: {
    height: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  scannerOverlay: {
    alignItems: 'center',
    backgroundColor: '#0008',
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  scannerText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
  },
});
