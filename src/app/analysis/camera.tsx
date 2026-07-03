import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraGuide } from '@/components/analysis/camera-guide';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { createAnalysis, uploadCaptures, type Capture } from '@/features/analyses';
import { useAuth } from '@/features/auth';
import { PHOTO_ANGLES, TOTAL_CAPTURES, VIDEO_CAPTURE } from '@/lib/analysis-steps';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const FLASH_CYCLE: FlashMode[] = ['auto', 'on', 'off'];
const FLASH_ICON: Record<FlashMode, keyof typeof Ionicons.glyphMap> = {
  auto: 'flash-outline',
  on: 'flash',
  off: 'flash-off',
  screen: 'sunny-outline',
};

type Phase = 'photos' | 'video';

const fmtTime = (s: number) => `0:${String(s).padStart(2, '0')}`;

export default function CameraScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMic] = useMicrophonePermissions();

  const [phase, setPhase] = useState<Phase>('photos');
  const [photos, setPhotos] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [facing, setFacing] = useState<CameraType>('front');
  const [guide, setGuide] = useState({ w: 0, h: 0 });

  // Timer visible mientras se graba el video
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const photoIndex = photos.length;
  const angle = PHOTO_ANGLES[Math.min(photoIndex, PHOTO_ANGLES.length - 1)];
  const progress =
    phase === 'photos'
      ? (photos.length / TOTAL_CAPTURES) * 100
      : ((PHOTO_ANGLES.length + Math.min(elapsed / VIDEO_CAPTURE.maxDuration, 1)) / TOTAL_CAPTURES) *
        100;

  const onGuideLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setGuide({ w: width, h: height });
  };

  const capturePhoto = async () => {
    if (busy || phase !== 'photos') return;
    setBusy(true);
    try {
      const shot = await cameraRef.current?.takePictureAsync({ quality: 0.7, skipProcessing: true });
      addPhoto(shot?.uri ?? '');
    } catch {
      // En web o si el disparo falla, avanzamos igual para no trabar el demo.
      addPhoto('');
    } finally {
      setBusy(false);
    }
  };

  const addPhoto = (uri: string) => {
    setPhotos((prev) => {
      const next = [...prev, uri];
      if (next.length >= PHOTO_ANGLES.length) setPhase('video');
      return next;
    });
  };

  const toggleRecording = async () => {
    if (recording) {
      cameraRef.current?.stopRecording();
      return;
    }
    if (!micPermission?.granted) {
      const res = await requestMic();
      if (!res?.granted) return;
    }
    setElapsed(0);
    setRecording(true);
    try {
      const rec = await cameraRef.current?.recordAsync({ maxDuration: VIDEO_CAPTURE.maxDuration });
      finish(rec?.uri ?? null);
    } catch {
      finish(null);
    }
  };

  const goToProcessing = (videoUri: string | null, analysisId?: string) => {
    router.replace({
      pathname: '/analysis/processing',
      params: {
        ...(analysisId ? { analysisId } : {}),
        photos: String(photos.length),
        video: videoUri ? '1' : '0',
      },
    });
  };

  const finish = async (videoUri: string | null) => {
    setRecording(false);

    // Sin sesión activa mantenemos el flujo mockeado del demo (no tocamos Supabase).
    if (!user) {
      goToProcessing(videoUri);
      return;
    }

    // Con usuario logueado: creamos el análisis y subimos las capturas al storage,
    // siempre a través del feature `@/features/analyses` (la UI no habla con Supabase).
    setBusy(true);
    try {
      const analysisId = await createAnalysis();
      const captures: Capture[] = [
        ...photos
          .map((uri, i) => ({ uri, kind: 'photo' as const, angle: PHOTO_ANGLES[i]?.id }))
          .filter((c) => Boolean(c.uri)),
        ...(videoUri ? [{ uri: videoUri, kind: 'video' as const }] : []),
      ];
      await uploadCaptures(analysisId, captures);
      goToProcessing(videoUri, analysisId);
    } catch {
      // Si algo falla, no rompemos el demo: seguimos al processing en modo mock.
      goToProcessing(videoUri);
    } finally {
      setBusy(false);
    }
  };

  const cycleFlash = () => {
    setFlash(FLASH_CYCLE[(FLASH_CYCLE.indexOf(flash) + 1) % FLASH_CYCLE.length]);
  };
  const flipFacing = () => setFacing((f) => (f === 'front' ? 'back' : 'front'));

  const granted = permission?.granted ?? false;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Fondo: cámara real o placeholder oscuro */}
      {granted ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          mode={phase === 'video' ? 'video' : 'picture'}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
      )}

      {/* Overlay */}
      <View style={StyleSheet.absoluteFill}>
        {/* Barra superior */}
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}>
              <Ionicons name="close" size={24} color={palette.white} />
            </Pressable>

            {recording ? (
              <View style={styles.recPill}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>REC {fmtTime(elapsed)}</Text>
              </View>
            ) : (
              <View style={styles.statusPill}>
                <View style={styles.liveDot} />
                <Text style={styles.statusText}>DENTA IA ACTIVE</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.statusSub}>
                  {phase === 'photos' ? 'MODO FOTO' : 'MODO 3D'}
                  {'\n'}ENFOQUE: LISTO
                </Text>
              </View>
            )}

            <Pressable
              onPress={cycleFlash}
              accessibilityRole="button"
              accessibilityLabel={`Flash: ${flash}`}
              hitSlop={8}
              style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}>
              <Ionicons name={FLASH_ICON[flash]} size={22} color={palette.white} />
            </Pressable>
          </View>
        </SafeAreaView>

        {granted ? (
          <>
            {/* Área de guía */}
            <View style={styles.guideArea} onLayout={onGuideLayout}>
              <CameraGuide
                width={guide.w}
                height={guide.h}
                color={recording ? '#F87171' : palette.teal}
              />
              <Text style={styles.guideHint}>
                {phase === 'photos' ? angle.hint : VIDEO_CAPTURE.hint}
              </Text>
            </View>

            {/* Panel inferior */}
            <View style={styles.bottomPanel}>
              {/* Indicador de pasos: 3 fotos + video */}
              <View style={styles.stepsRow}>
                {PHOTO_ANGLES.map((s, i) => {
                  const state = i < photos.length ? 'done' : phase === 'photos' && i === photos.length ? 'active' : 'pending';
                  return (
                    <StepChip key={s.id} label={s.short} state={state}>
                      {state === 'done' ? (
                        <Ionicons name="checkmark" size={16} color={palette.white} />
                      ) : (
                        <Text style={[styles.stepNum, state === 'active' && styles.stepNumActive]}>
                          {i + 1}
                        </Text>
                      )}
                    </StepChip>
                  );
                })}
                <StepChip label={VIDEO_CAPTURE.short} state={phase === 'video' ? 'active' : 'pending'}>
                  <Ionicons
                    name="videocam"
                    size={15}
                    color={phase === 'video' ? palette.white : 'rgba(255,255,255,0.7)'}
                  />
                </StepChip>
              </View>

              <Text style={styles.instruction}>
                {phase === 'photos' ? angle.instruction : VIDEO_CAPTURE.instruction}
              </Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              {/* Controles: flip · disparador/rec · miniaturas/omitir */}
              <View style={styles.controlsRow}>
                <View style={styles.sideCol}>
                  {!recording && (
                    <Pressable
                      onPress={flipFacing}
                      accessibilityRole="button"
                      accessibilityLabel="Girar cámara"
                      hitSlop={8}
                      style={({ pressed }) => [styles.sideBtn, pressed && styles.roundBtnPressed]}>
                      <Ionicons name="camera-reverse-outline" size={24} color={palette.white} />
                    </Pressable>
                  )}
                </View>

                {phase === 'photos' ? (
                  <Pressable
                    onPress={capturePhoto}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel={`Capturar ${angle.short}`}
                    accessibilityHint={`Foto ${photoIndex + 1} de ${PHOTO_ANGLES.length}`}
                    style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterPressed]}>
                    <View style={styles.shutterInner}>
                      <MaterialCommunityIcons name="camera-iris" size={30} color={palette.white} />
                    </View>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={toggleRecording}
                    accessibilityRole="button"
                    accessibilityLabel={recording ? 'Detener grabación' : 'Grabar video 3D'}
                    style={({ pressed }) => [styles.shutterOuter, styles.recOuter, pressed && styles.shutterPressed]}>
                    <View style={recording ? styles.recStop : styles.recStart} />
                  </Pressable>
                )}

                <View style={[styles.sideCol, styles.sideColRight]}>
                  {phase === 'photos' ? (
                    <View style={styles.thumbs}>
                      {photos.filter(Boolean).slice(-3).map((uri, i) => (
                        <Image key={`${uri}-${i}`} source={{ uri }} style={styles.thumb} contentFit="cover" />
                      ))}
                    </View>
                  ) : (
                    !recording && (
                      <Pressable
                        onPress={() => finish(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Omitir video"
                        hitSlop={8}
                        style={({ pressed }) => pressed && styles.roundBtnPressed}>
                        <Text style={styles.skip}>Omitir</Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>
            </View>
          </>
        ) : (
          <PermissionPrompt canAsk={permission?.canAskAgain ?? true} onGrant={requestPermission} />
        )}
      </View>
    </View>
  );
}

function StepChip({
  label,
  state,
  children,
}: {
  label: string;
  state: 'done' | 'active' | 'pending';
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepCircle,
          state === 'active' && styles.stepActive,
          state === 'done' && styles.stepDone,
        ]}>
        {children}
      </View>
      <Text
        style={[styles.stepLabel, state === 'active' && styles.stepLabelActive]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function PermissionPrompt({ canAsk, onGrant }: { canAsk: boolean; onGrant: () => void }) {
  return (
    <Reveal index={0} style={styles.permWrap}>
      <View style={styles.permIcon}>
        <Ionicons name="camera-outline" size={40} color={palette.white} />
      </View>
      <Text style={styles.permTitle}>Necesitamos tu cámara</Text>
      <Text style={styles.permDesc}>
        DENTA IA usa la cámara para analizar tu salud bucal. Las imágenes se procesan de forma
        segura.
      </Text>
      <Button
        label={canAsk ? 'Permitir cámara' : 'Habilitá la cámara en Ajustes'}
        left={<Ionicons name="camera" size={20} color={palette.white} />}
        onPress={onGrant}
        disabled={!canAsk}
        fullWidth={false}
        style={styles.permBtn}
      />
    </Reveal>
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
  roundBtnPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },
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

  recPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.9)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.white },
  recText: { ...typography.small, color: palette.white, fontWeight: '800', letterSpacing: 1 },

  guideArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guideHint: {
    position: 'absolute',
    bottom: spacing.xl,
    ...typography.body,
    color: palette.white,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
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

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
  sideCol: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  sideColRight: { alignItems: 'flex-end' },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbs: { flexDirection: 'row', gap: 4 },
  thumb: {
    width: 32,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skip: { ...typography.bodyStrong, color: 'rgba(255,255,255,0.8)' },

  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
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
  recOuter: { borderColor: 'rgba(248,113,113,0.5)' },
  recStart: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#EF4444' },
  recStop: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#EF4444' },

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
  permBtn: { marginTop: spacing.lg },
});
