import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraGuide } from '@/components/analysis/camera-guide';
import { ANALYSIS_STEPS } from '@/lib/analysis-steps';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const FLASH_CYCLE: FlashMode[] = ['auto', 'on', 'off'];
const FLASH_ICON: Record<FlashMode, keyof typeof Ionicons.glyphMap> = {
  auto: 'flash-outline',
  on: 'flash',
  off: 'flash-off',
  screen: 'sunny-outline',
};

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [stepIndex, setStepIndex] = useState(0);
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [guide, setGuide] = useState({ w: 0, h: 0 });

  const total = ANALYSIS_STEPS.length;
  const step = ANALYSIS_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / total) * 100;

  const onGuideLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setGuide({ w: width, h: height });
  };

  const handleCapture = () => {
    if (stepIndex < total - 1) {
      setStepIndex((i) => i + 1);
    } else {
      // Capturados los 6 ángulos → al procesamiento
      router.replace('/analysis/processing');
    }
  };

  const cycleFlash = () => {
    const next = FLASH_CYCLE[(FLASH_CYCLE.indexOf(flash) + 1) % FLASH_CYCLE.length];
    setFlash(next);
  };

  const granted = permission?.granted ?? false;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Fondo: cámara real o placeholder oscuro */}
      {granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="front" flash={flash} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
      )}

      {/* Overlay */}
      <View style={StyleSheet.absoluteFill}>
        {/* Barra superior */}
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" style={styles.roundBtn}>
              <Ionicons name="close" size={24} color={palette.white} />
            </Pressable>

            <View style={styles.statusPill}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>DENTA IA ACTIVE</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.statusSub}>LUZ: ÓPTIMO{'\n'}ENFOQUE: LISTO</Text>
            </View>

            <Pressable onPress={cycleFlash} accessibilityLabel="Flash" style={styles.roundBtn}>
              <Ionicons name={FLASH_ICON[flash]} size={22} color={palette.white} />
            </Pressable>
          </View>
        </SafeAreaView>

        {granted ? (
          <>
            {/* Área de guía */}
            <View style={styles.guideArea} onLayout={onGuideLayout}>
              <CameraGuide width={guide.w} height={guide.h} />
              <Text style={styles.guideHint}>Alineá la arcada dentro de la guía</Text>
            </View>

            {/* Panel inferior */}
            <View style={styles.bottomPanel}>
              <View style={styles.stepsRow}>
                {ANALYSIS_STEPS.map((s, i) => {
                  const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
                  return (
                    <View key={s.id} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          state === 'active' && styles.stepActive,
                          state === 'done' && styles.stepDone,
                        ]}>
                        {state === 'done' ? (
                          <Ionicons name="checkmark" size={16} color={palette.white} />
                        ) : (
                          <Text
                            style={[
                              styles.stepNum,
                              state === 'active' && styles.stepNumActive,
                            ]}>
                            {i + 1}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[styles.stepLabel, state === 'active' && styles.stepLabelActive]}
                        numberOfLines={1}>
                        {s.short}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.instruction}>{step.instruction}</Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              {/* Disparador */}
              <Pressable
                onPress={handleCapture}
                accessibilityLabel={`Capturar ${step.short}`}
                style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterPressed]}>
                <View style={styles.shutterInner}>
                  <MaterialCommunityIcons name="camera-iris" size={30} color={palette.white} />
                </View>
              </Pressable>
            </View>
          </>
        ) : (
          <PermissionPrompt
            canAsk={permission?.canAskAgain ?? true}
            onGrant={requestPermission}
          />
        )}
      </View>
    </View>
  );
}

function PermissionPrompt({ canAsk, onGrant }: { canAsk: boolean; onGrant: () => void }) {
  return (
    <View style={styles.permWrap}>
      <View style={styles.permIcon}>
        <Ionicons name="camera-outline" size={40} color={palette.white} />
      </View>
      <Text style={styles.permTitle}>Necesitamos tu cámara</Text>
      <Text style={styles.permDesc}>
        DENTA IA usa la cámara para analizar tu salud bucal. Las imágenes se procesan de forma
        segura.
      </Text>
      <Pressable onPress={onGrant} style={styles.permBtn} disabled={!canAsk}>
        <Text style={styles.permBtnText}>
          {canAsk ? 'Permitir cámara' : 'Habilitá la cámara en Ajustes'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  fallbackBg: { backgroundColor: '#0F172A' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' },
  statusText: { ...typography.small, color: palette.white, fontWeight: '700', letterSpacing: 0.5 },
  statusDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  statusSub: { fontSize: 8, lineHeight: 10, color: '#5EEAD4', fontWeight: '700' },

  guideArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guideHint: {
    position: 'absolute',
    bottom: spacing.xl,
    ...typography.body,
    color: palette.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },

  bottomPanel: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  stepItem: { alignItems: 'center', gap: 6, flex: 1 },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: { backgroundColor: palette.teal },
  stepDone: { backgroundColor: palette.tealDark },
  stepNum: { ...typography.caption, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  stepNumActive: { color: palette.white },
  stepLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  stepLabelActive: { color: palette.white, fontWeight: '700' },

  instruction: {
    ...typography.bodyStrong,
    color: '#5EEAD4',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.teal },

  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  shutterPressed: { transform: [{ scale: 0.94 }] },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  permWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'], gap: spacing.md },
  permIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  permTitle: { ...typography.h2, color: palette.white, textAlign: 'center' },
  permDesc: { ...typography.body, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 300 },
  permBtn: {
    marginTop: spacing.lg,
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  permBtnText: { ...typography.subtitle, color: palette.white },
});
