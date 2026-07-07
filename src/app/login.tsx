import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Reveal } from '@/components/ui/reveal';
import { TextureGrid } from '@/components/ui/texture-grid';
import { RoleSelector, useAuth, type UserRole } from '@/features/auth';
import { homeForRole } from '@/lib/routes';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, enterDemo } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('paciente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Toggle animado
  const [segW, setSegW] = useState(0);
  const seg = useRef(new Animated.Value(0)).current;
  const switchMode = (m: Mode) => {
    Animated.spring(seg, { toValue: m === 'login' ? 0 : 1, useNativeDriver: true, bounciness: 8 }).start();
    setMode(m);
  };
  const highlightX = seg.interpolate({ inputRange: [0, 1], outputRange: [0, segW / 2] });

  // Shake en error
  const shakeX = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence(
      [-9, 9, -7, 7, 0].map((to) =>
        Animated.timing(shakeX, { toValue: to, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  const submit = async () => {
    const missing = !email.trim() || !password.trim() || (mode === 'signup' && !name.trim());
    if (missing) return shake();

    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: err, role: userRole } = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError(err);
        return shake();
      }
      router.replace(homeForRole(userRole));
    } else {
      const { error: err, needsConfirmation } = await signUp(name, email, password, role);
      setLoading(false);
      if (err) {
        setError(err);
        return shake();
      }
      if (needsConfirmation) {
        setNotice('Te enviamos un email para confirmar tu cuenta. Revisá tu bandeja.');
        return;
      }
      router.replace(homeForRole(role));
    }
  };

  const socialSoon = () => {
    setError(null);
    setNotice('Google y Apple llegan pronto. Por ahora entrá con tu email.');
  };

  // Modo demo: entra con un usuario ficticio (sin backend) para recorrer la app.
  const enterAsDemo = async (demoRole: UserRole) => {
    setError(null);
    setNotice(null);
    setLoading(true);
    await enterDemo(demoRole);
    setLoading(false);
    router.replace(homeForRole(demoRole));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}>
          {/* Header de marca */}
          <LinearGradient
            colors={[palette.navy, palette.primary, palette.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + spacing['2xl'] }]}>
            <TextureGrid opacity={0.09} />
            <View style={styles.blob} pointerEvents="none" />
            <View style={styles.mascot}>
              <View style={styles.mascotGlow} pointerEvents="none" />
              <View style={styles.mascotCircle}>
                <MaterialCommunityIcons name="robot-happy" size={40} color={palette.primary} />
              </View>
            </View>
            <Text style={styles.wordmark}>
              Dental<Text style={styles.wordmarkAccent}>AI</Text>
            </Text>
            <Text style={styles.tagline}>Cuidamos tu sonrisa con inteligencia</Text>
          </LinearGradient>

          {/* Tarjeta de formulario */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeX }] }]}>
            {/* Toggle Ingresar / Crear cuenta */}
            <View style={styles.segment} onLayout={(e) => setSegW(e.nativeEvent.layout.width)}>
              {segW > 0 && (
                <Animated.View
                  style={[styles.segHighlight, { width: segW / 2, transform: [{ translateX: highlightX }] }]}
                />
              )}
              <Pressable style={styles.segBtn} accessibilityRole="button" onPress={() => switchMode('login')}>
                <Text style={[styles.segText, mode === 'login' && styles.segTextActive]}>Ingresar</Text>
              </Pressable>
              <Pressable style={styles.segBtn} accessibilityRole="button" onPress={() => switchMode('signup')}>
                <Text style={[styles.segText, mode === 'signup' && styles.segTextActive]}>Crear cuenta</Text>
              </Pressable>
            </View>

            {mode === 'signup' && (
              <Reveal index={0}>
                <RoleSelector value={role} onChange={setRole} />
              </Reveal>
            )}

            {mode === 'signup' && (
              <Reveal index={0}>
                <Field
                  icon="person-outline"
                  placeholder="Nombre completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </Reveal>
            )}

            <Reveal index={1}>
              <Field
                icon="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Reveal>

            <Reveal index={2}>
              <Field
                icon="lock-closed-outline"
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                right={
                  <Pressable
                    onPress={() => setShowPass((s) => !s)}
                    accessibilityRole="button"
                    accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    hitSlop={8}>
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={palette.textMuted}
                    />
                  </Pressable>
                }
              />
            </Reveal>

            {mode === 'login' && (
              <Pressable style={styles.forgot} accessibilityRole="button">
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            )}

            {/* Mensajes de error / aviso */}
            {error && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color={palette.danger ?? '#E5484D'} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {notice && (
              <View style={styles.noticeRow}>
                <Ionicons name="mail-outline" size={16} color={palette.primary} />
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            )}

            {/* CTA principal */}
            <Pressable
              onPress={submit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, loading && styles.primaryDisabled]}>
              {loading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <>
                  <Text style={styles.primaryText}>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</Text>
                  <Ionicons name="arrow-forward" size={18} color={palette.white} />
                </>
              )}
            </Pressable>

            {/* Divisor */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o continuá con</Text>
              <View style={styles.divider} />
            </View>

            {/* Sociales */}
            <View style={styles.socialRow}>
              <SocialButton icon="logo-google" label="Google" onPress={socialSoon} />
              <SocialButton icon="logo-apple" label="Apple" onPress={socialSoon} />
            </View>

            {/* Modo demo: recorrer la app con datos ficticios, sin cuenta */}
            <View style={styles.demoBox}>
              <View style={styles.demoHeader}>
                <MaterialCommunityIcons name="flask-outline" size={15} color={palette.primary} />
                <Text style={styles.demoTitle}>Explorar en modo demo</Text>
              </View>
              <Text style={styles.demoHint}>Entrá con un usuario ficticio para ver todo sin backend.</Text>
              <View style={styles.demoRow}>
                <DemoChip icon="person" label="Paciente" onPress={() => enterAsDemo('paciente')} />
                <DemoChip icon="medkit" label="Odontólogo" onPress={() => enterAsDemo('odontologo')} />
                <DemoChip icon="settings" label="Admin" onPress={() => enterAsDemo('admin')} />
              </View>
            </View>
          </Animated.View>

          <Text style={styles.legal}>
            Al continuar aceptás nuestros Términos y Política de Privacidad.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ---------------- Sub-componentes ---------------- */

function Field({
  icon,
  right,
  ...input
}: {
  icon: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  const focus = useRef(new Animated.Value(0)).current;
  const borderColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.border, palette.primary],
  });
  const anim = (to: number) =>
    Animated.timing(focus, { toValue: to, duration: 160, useNativeDriver: false }).start();

  return (
    <Animated.View style={[styles.field, { borderColor }]}>
      <Ionicons name={icon} size={20} color={palette.textMuted} />
      <TextInput
        style={styles.input}
        placeholderTextColor={palette.textMuted}
        onFocus={() => anim(1)}
        onBlur={() => anim(0)}
        {...input}
      />
      {right}
    </Animated.View>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Continuar con ${label}`}
      style={({ pressed }) => [styles.social, pressed && styles.socialPressed]}>
      <Ionicons name={icon} size={20} color={palette.textPrimary} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

function DemoChip({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Entrar como ${label} (demo)`}
      style={({ pressed }) => [styles.demoChip, pressed && styles.demoChipPressed]}>
      <Ionicons name={icon} size={16} color={palette.primary} />
      <Text style={styles.demoChipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing['3xl'] },

  header: {
    alignItems: 'center',
    paddingBottom: spacing['3xl'],
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  mascot: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  mascotGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  mascotCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  wordmark: { fontSize: 26, fontWeight: '800', color: palette.white, marginTop: spacing.md },
  wordmarkAccent: { color: palette.tealLight },
  tagline: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  card: {
    backgroundColor: palette.surface,
    marginHorizontal: spacing.xl,
    marginTop: -spacing['2xl'],
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.xl,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segHighlight: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, zIndex: 1 },
  segText: { ...typography.bodyStrong, color: palette.textSecondary },
  segTextActive: { color: palette.primary },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    marginTop: spacing.md,
  },
  input: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: 0 },

  forgot: { alignSelf: 'flex-end', marginTop: spacing.md },
  forgotText: { ...typography.caption, color: palette.primary, fontWeight: '600' },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  errorText: { ...typography.caption, color: palette.danger, fontWeight: '600', flex: 1 },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  noticeText: { ...typography.caption, color: palette.primary, fontWeight: '600', flex: 1 },

  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  primaryPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  primaryDisabled: { opacity: 0.7 },
  primaryText: { ...typography.subtitle, color: palette.white, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  divider: { flex: 1, height: 1, backgroundColor: palette.border },
  dividerText: { ...typography.caption, color: palette.textMuted },

  socialRow: { flexDirection: 'row', gap: spacing.md },
  social: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.surface,
  },
  socialPressed: { backgroundColor: palette.surfaceAlt },
  socialText: { ...typography.bodyStrong, color: palette.textPrimary },

  /* Modo demo */
  demoBox: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: 'dashed',
    backgroundColor: palette.surfaceAlt,
  },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  demoTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  demoHint: { ...typography.small, color: palette.textSecondary, marginTop: 4 },
  demoRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: palette.surface,
  },
  demoChipPressed: { backgroundColor: palette.primarySoft, opacity: 0.9 },
  demoChipText: { ...typography.caption, color: palette.primary, fontWeight: '700' },

  legal: {
    ...typography.small,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing['2xl'],
  },
});
