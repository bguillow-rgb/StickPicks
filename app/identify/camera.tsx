import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [capturing, setCapturing] = useState(false);

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.permText}>Camera access is required to scan cigars</Text>
        <Button title="Grant Permission" onPress={requestPermission} style={{ marginTop: SPACING.md }} />
        <Button title="Go Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: SPACING.sm }} />
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        router.push({ pathname: '/identify/result', params: { imageUri: photo.uri } });
      }
    } catch (e: any) {
      Alert.alert('Capture Error', e?.message ?? 'Failed to capture photo');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.topBtn, { top: insets.top + 10, left: 16 }]}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>

        {/* Flip camera */}
        <Pressable
          onPress={() => setFacing((f) => f === 'back' ? 'front' : 'back')}
          style={[styles.topBtn, { top: insets.top + 10, right: 16 }]}
        >
          <Ionicons name="camera-reverse-outline" size={24} color={COLORS.text} />
        </Pressable>

        {/* Frame guide */}
        <View style={styles.frameGuide}>
          <View style={styles.frameCornerTL} />
          <View style={styles.frameCornerTR} />
          <View style={styles.frameCornerBL} />
          <View style={styles.frameCornerBR} />
        </View>

        <Text style={styles.hint}>Point at the cigar band</Text>

        {/* Capture button */}
        <View style={[styles.captureRow, { bottom: insets.bottom + 30 }]}>
          <Pressable
            onPress={handleCapture}
            disabled={capturing}
            style={[styles.captureBtn, capturing && { opacity: 0.5 }]}
          >
            <View style={styles.captureInner} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const CORNER = { width: 30, height: 30, borderColor: COLORS.accent, position: 'absolute' as const };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  permText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  topBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  frameGuide: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '35%',
  },
  frameCornerTL: { ...CORNER, top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  frameCornerTR: { ...CORNER, top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  frameCornerBL: { ...CORNER, bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  frameCornerBR: { ...CORNER, bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: {
    position: 'absolute',
    bottom: '38%',
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  captureRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.accent,
  },
});
