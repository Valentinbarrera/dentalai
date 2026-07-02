import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KidsMascot } from '@/components/videos/kids-mascot';
import { BrandBand } from '@/components/ui/brand-band';
import { Reveal } from '@/components/ui/reveal';
import { ScreenContainer } from '@/components/ui/screen-container';
import { FEATURED, KIDS_MASCOT, KIDS_VIDEOS, Video, VIDEO_SECTIONS } from '@/lib/videos';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function VideosScreen() {
  const kidsIndex = VIDEO_SECTIONS.length + 1;

  return (
    <ScreenContainer scroll padded={false} edges={[]} background={palette.background}>
      <StatusBar style="light" />

      <BrandBand
        title="Videos educativos"
        subtitle="Aprendé y compartí con tus pacientes."
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            hitSlop={8}
            style={({ pressed }) => [styles.bellGlass, pressed && styles.bellPressed]}>
            <Ionicons name="notifications-outline" size={22} color={palette.white} />
          </Pressable>
        }
      />

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
          <View style={styles.sectionHeadingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
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
          <View style={styles.accentBar} />
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
    </ScreenContainer>
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
  bellGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },

  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

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

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.xl,
    marginRight: spacing.xl,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
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

  kidsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginLeft: spacing.xl, marginTop: spacing['2xl'], marginRight: spacing.xl },
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
