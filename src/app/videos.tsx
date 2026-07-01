import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KidsMascot } from '@/components/videos/kids-mascot';
import { FEATURED, KIDS_MASCOT, KIDS_VIDEOS, Video, VIDEO_SECTIONS } from '@/lib/videos';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function VideosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={styles.logo}>DentalAI</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Featured */}
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

        {/* Secciones */}
        {VIDEO_SECTIONS.map((section) => (
          <View key={section.id}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {section.videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </ScrollView>
          </View>
        ))}

        {/* Rincón de los Chicos */}
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
            <View style={styles.kidsBtn}>
              <Ionicons name="play" size={15} color={palette.white} />
              <Text style={styles.kidsBtnText}>Empezar a jugar</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {KIDS_VIDEOS.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <Pressable style={styles.card}>
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
  logo: { ...typography.h2, fontSize: 20, color: palette.primary, fontWeight: '800' },
  content: { paddingBottom: spacing['3xl'] },

  featured: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.sm },
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

  kidsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kidsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.warningSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing['2xl'],
  },
  kidsPillText: { ...typography.small, color: palette.warning, fontWeight: '700' },

  kidsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
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
  kidsBtnText: { ...typography.bodyStrong, color: palette.white },
});
