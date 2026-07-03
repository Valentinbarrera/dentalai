import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KidsMascot } from '@/components/videos/kids-mascot';
import { BrandBand } from '@/components/ui/brand-band';
import { Reveal } from '@/components/ui/reveal';
import { ScreenContainer } from '@/components/ui/screen-container';
import { useVideos, Video } from '@/features/videos';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

/** Gradiente de marca para la miniatura cuando el video no trae `thumbnailUrl`. */
const FALLBACK_ACCENT: [string, string] = [palette.teal, palette.primary];

/** Título de la sección para los videos sin categoría cargada. */
const UNCATEGORIZED = 'Videos';

type Section = { key: string; title: string; videos: Video[] };

/** Agrupa los videos por categoría, preservando el orden (más nuevos primero). */
function groupByCategory(videos: Video[]): Section[] {
  const sections: Section[] = [];
  const byKey = new Map<string, Section>();

  for (const video of videos) {
    const title = video.category?.trim() || UNCATEGORIZED;
    let section = byKey.get(title);
    if (!section) {
      section = { key: title, title, videos: [] };
      byKey.set(title, section);
      sections.push(section);
    }
    section.videos.push(video);
  }

  return sections;
}

export default function VideosScreen() {
  const { videos, loading, error } = useVideos();
  const sections = groupByCategory(videos);

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

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : videos.length === 0 ? (
        <EmptyState />
      ) : (
        sections.map((section, i) => (
          <Reveal key={section.key} index={i + 1}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {section.videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </ScrollView>
          </Reveal>
        ))
      )}
    </ScreenContainer>
  );
}

function VideoCard({ video }: { video: Video }) {
  const durationLabel = video.duration?.trim();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reproducir ${video.title}${durationLabel ? `, duración ${durationLabel}` : ''}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {video.thumbnailUrl ? (
        <View style={styles.thumb}>
          <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbImage} resizeMode="cover" />
          <View style={styles.playCircle}>
            <Ionicons name="play" size={18} color={palette.white} />
          </View>
          {durationLabel ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{durationLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <LinearGradient colors={FALLBACK_ACCENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
          <MaterialCommunityIcons name="play-circle-outline" size={40} color="rgba(255,255,255,0.9)" />
          <View style={styles.playCircle}>
            <Ionicons name="play" size={18} color={palette.white} />
          </View>
          {durationLabel ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{durationLabel}</Text>
            </View>
          ) : null}
        </LinearGradient>
      )}
      <Text style={styles.cardTitle} numberOfLines={1}>
        {video.title}
      </Text>
      {video.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {video.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

function LoadingState() {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator color={palette.primary} />
      <Text style={styles.stateText}>Cargando videos…</Text>
    </View>
  );
}

function ErrorState() {
  return (
    <View style={styles.centerState}>
      <Ionicons name="cloud-offline-outline" size={30} color={palette.textMuted} />
      <Text style={styles.stateText}>
        No pudimos cargar los videos. Revisá tu conexión e intentá de nuevo.
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <Reveal index={1}>
      <View style={styles.emptyState}>
        <KidsMascot size={96} />
        <Text style={styles.emptyStateTitle}>Todavía no hay videos disponibles</Text>
        <Text style={styles.emptyStateText}>
          Pronto vas a encontrar contenido de tus profesionales.
        </Text>
      </View>
    </Reveal>
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

  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },

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

  card: { width: 220 },
  thumb: { height: 130, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
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

  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing['4xl'],
    paddingVertical: spacing['3xl'],
  },
  stateText: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing['3xl'],
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow.card,
  },
  emptyStateTitle: {
    ...typography.subtitle,
    color: palette.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});
