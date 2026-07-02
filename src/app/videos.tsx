import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KidsMascot } from '@/components/videos/kids-mascot';
import { Reveal } from '@/components/ui/reveal';
import { FEATURED, KIDS_MASCOT, KIDS_VIDEOS, Video, VIDEO_SECTIONS } from '@/lib/videos';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function VideosScreen() {
  const router = useRouter();
  const kidsIndex = VIDEO_SECTIONS.length + 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
          <Ionicons name="arrow-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={styles.logo}>DentalAI</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
          <Ionicons name="notifications-outline" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Reveal index={0}>
          <Text style={styles.screenTitle}>Videos educativos</Text>
          <Text style={styles.screenSub}>Aprendé y compartí con tus pacientes.</Text>
        </Reveal>

        {/* Featured */}
        <Reveal index={1}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reproducir video destacado: ${FEATURED.title}`}
            style={({ pressed }) => pressed && styles.cardPressed}>
            <LinearGradient colors={FEATURED.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.featured, shadow.card]}>
              <View style={styles.featuredBadge}>
                <MaterialCommunityIcons name="star-four-points" size={12} color={palette.white} />
                <Text style={styles.featuredBadgeText}>{FEATURED.badge}</Text>
              </View>
              <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>
                {FEATURED.desc}
              </Text>
              <View style={styles.featuredFooter}>
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={16} color={palette.primary} />
                  <Text style={styles.playBtnText}>Reproducir</Text>
                </View>
                <Text style={styles.featuredDuration}>{FEATURED.duration}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Reveal>

        {/* Secciones */}
        {VIDEO_SECTIONS.map((section, i) => (
          <Reveal key={section.id} index={i + 2}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.videos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {section.videos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </ScrollView>
            ) : (
              <EmptyRow text="Todavía no hay videos en esta sección." />
            )}
          </Reveal>
        ))}

        {/* Rincón de los Chicos */}
        <Reveal index={kidsIndex}>
          <View style={styles.kidsHeader}>
            <Text style={styles.sectionTitle}>Rincón de los Chicos</Text>
            <View style={styles.kidsPill}>
              <Ionicons name="happy-outline" size={13} color={palette.warning} />
              <Text style={styles.kidsPillText}>Para peques</Text>
            </View>
          </View>

          <LinearGradient colors={['#FDE68A', '#FBCFE8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.kidsCard, shadow.card]}>
            <KidsMascot size={92} />
            <View style={styles.kidsTextCol}>
              <Text style={styles.kidsGreeting}>{KIDS_MASCOT.greeting}</Text>
              <Text style={styles.kidsMessage}>{KIDS_MASCOT.message}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Empezar a jugar con Denti"
                style={({ pressed }) => [styles.kidsBtn, pressed && styles.kidsBtnPressed]}>
                <Ionicons name="play" size={15} color={palette.white} />
                <Text style={styles.kidsBtnText}>Empezar a jugar</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Reveal>

        <Reveal index={kidsIndex + 1}>
          {KIDS_VIDEOS.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kidsRow}>
              {KIDS_VIDEOS.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </ScrollView>
          ) : (
            <EmptyRow text="Pronto Denti traerá nuevos juegos. ¡Volvé a visitarnos!" playful />
          )}
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reproducir ${video.title}, duración ${video.duration}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <LinearGradient colors={video.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
        <MaterialCommunityIcons name={video.icon as any} size={40} color="rgba(255,255,255,0.9)" />
        <View style={styles.playCircle}>
          <Ionicons name="play" size={18} color={palette.white} />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </LinearGradient>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {video.title}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {video.desc}
      </Text>
    </Pressable>
  );
}

function EmptyRow({ text, playful = false }: { text: string; playful?: boolean }) {
  return (
    <View style={[styles.emptyRow, playful && styles.emptyRowPlayful]}>
      <Ionicons
        name={playful ? 'happy-outline' : 'film-outline'}
        size={26}
        color={playful ? palette.warning : palette.textMuted}
      />
      <Text style={[styles.emptyText, playful && styles.emptyTextPlayful]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  logo: { ...typography.h2, fontSize: 20, color: palette.primary, fontWeight: '800' },
  content: { paddingBottom: spacing['3xl'] },

  screenTitle: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.sm, marginHorizontal: spacing.xl },
  screenSub: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs, marginHorizontal: spacing.xl },

  featured: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.lg },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  featuredBadgeText: { ...typography.small, color: palette.white, fontWeight: '700' },
  featuredTitle: { ...typography.h1, color: palette.white, marginTop: spacing.md },
  featuredDesc: { ...typography.body, color: 'rgba(255,255,255,0.9)', marginTop: spacing.sm },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  playBtnText: { ...typography.bodyStrong, color: palette.primary },
  featuredDuration: { ...typography.caption, color: palette.white, fontWeight: '700' },

  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary, marginTop: spacing['2xl'], marginBottom: spacing.md, marginLeft: spacing.xl },
  row: { gap: spacing.md, paddingHorizontal: spacing.xl },
  kidsRow: { gap: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.md },

  card: { width: 220 },
  thumb: { height: 130, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  playCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  durationText: { ...typography.small, color: palette.white, fontWeight: '700' },
  cardTitle: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: spacing.sm },
  cardDesc: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  kidsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: spacing.xl, marginTop: spacing['2xl'], marginRight: spacing.xl },
  kidsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.warningSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  kidsPillText: { ...typography.small, color: palette.warning, fontWeight: '700' },

  kidsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  kidsTextCol: { flex: 1 },
  kidsGreeting: { ...typography.subtitle, color: '#7C2D12', fontWeight: '800' },
  kidsMessage: { ...typography.body, color: '#9A3412', marginTop: 2 },
  kidsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F97316',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  kidsBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  kidsBtnText: { ...typography.bodyStrong, color: palette.white },

  emptyRow: {
    marginHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyRowPlayful: { backgroundColor: palette.warningSoft, borderColor: '#FDE68A', marginTop: spacing.md },
  emptyText: { ...typography.caption, color: palette.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg },
  emptyTextPlayful: { color: '#9A3412', fontWeight: '600' },
});
