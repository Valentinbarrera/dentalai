import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function CredentialsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [diploma, setDiploma] = useState<string | null>(null);
  const [matricula, setMatricula] = useState('');
  const [university, setUniversity] = useState('');
  const [saved, setSaved] = useState(false);

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled) setDiploma(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setDiploma(res.assets[0].uri);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Credenciales Profesionales</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profesional */}
        <Card style={styles.proCard}>
          <LinearGradient colors={[palette.primary, palette.teal]} style={styles.avatar}>
            <MaterialCommunityIcons name="stethoscope" size={26} color={palette.white} />
          </LinearGradient>
          <View style={styles.flex}>
            <Text style={styles.proName}>Dr. Smith</Text>
            <Text style={styles.proSpecialty}>Odontología General</Text>
          </View>
          <Badge label={saved && diploma ? '● En revisión' : '● Incompleto'} tone={saved && diploma ? 'warning' : 'neutral'} />
        </Card>

        {/* Título */}
        <Text style={styles.sectionLabel}>Título Universitario</Text>
        {diploma ? (
          <View>
            <Image source={{ uri: diploma }} style={styles.diplomaImg} resizeMode="cover" />
            <View style={styles.diplomaOverlay}>
              <Badge label="⏳ Pendiente de verificación" tone="warning" />
            </View>
            <Pressable onPress={pickFromGallery} style={styles.changeBtn}>
              <Ionicons name="refresh" size={16} color={palette.primary} />
              <Text style={styles.changeText}>Cambiar imagen</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadBox}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={32} color={palette.primary} />
            </View>
            <Text style={styles.uploadHint}>Subí una foto o escaneo de tu diploma</Text>
            <View style={styles.uploadBtns}>
              <Pressable onPress={takePhoto} style={styles.uploadBtn}>
                <Ionicons name="camera-outline" size={18} color={palette.primary} />
                <Text style={styles.uploadBtnText}>Tomar foto</Text>
              </Pressable>
              <Pressable onPress={pickFromGallery} style={styles.uploadBtn}>
                <Ionicons name="images-outline" size={18} color={palette.primary} />
                <Text style={styles.uploadBtnText}>Galería</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Datos */}
        <Text style={styles.sectionLabel}>Número de Matrícula</Text>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="card-account-details-outline" size={18} color={palette.textMuted} />
          <TextInput
            value={matricula}
            onChangeText={setMatricula}
            placeholder="Ej: MP 12345"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
        </View>

        <Text style={styles.sectionLabel}>Universidad</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="school-outline" size={18} color={palette.textMuted} />
          <TextInput
            value={university}
            onChangeText={setUniversity}
            placeholder="Ej: Universidad de Buenos Aires"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={18} color={palette.teal} />
          <Text style={styles.noteText}>
            Verificamos tus credenciales en 24-48 hs. Una vez aprobadas, tu perfil mostrará la
            insignia de <Text style={styles.noteBold}>Profesional Verificado</Text>.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={saved ? 'Credenciales enviadas ✓' : 'Guardar credenciales'}
          disabled={!diploma || !matricula}
          left={!saved ? <Ionicons name="save-outline" size={18} color={palette.white} /> : undefined}
          onPress={() => setSaved(true)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.subtitle, color: palette.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  proCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  proName: { ...typography.subtitle, color: palette.textPrimary },
  proSpecialty: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  sectionLabel: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },

  uploadBox: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.primaryLight,
    borderStyle: 'dashed',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  uploadIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  uploadHint: { ...typography.caption, color: palette.textSecondary },
  uploadBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  uploadBtnText: { ...typography.bodyStrong, color: palette.primary },

  diplomaImg: { width: '100%', height: 200, borderRadius: radius.lg, backgroundColor: palette.surfaceAlt },
  diplomaOverlay: { position: 'absolute', top: spacing.md, left: spacing.md },
  changeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  changeText: { ...typography.bodyStrong, color: palette.primary },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: spacing.md },

  note: { flexDirection: 'row', gap: spacing.sm, backgroundColor: palette.tealSoft, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl },
  noteText: { ...typography.caption, color: palette.tealDark, flex: 1, lineHeight: 19 },
  noteBold: { fontWeight: '700' },

  ctaBar: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.border },
});
