import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { useAuth } from '@/features/auth';
import {
  createProcedure,
  updateProcedure,
  deleteProcedure,
  useProcedures,
  type Procedure,
} from '@/features/procedures';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const CURRENCY = 'USD';
const NO_CATEGORY = 'Sin categoría';

/** Formatea un precio unitario como `$1.800` (separador de miles, sin decimales si es entero). */
const priceFmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
function formatPrice(value: number): string {
  return `$${priceFmt.format(value)}`;
}

/** Parseo tolerante de un precio escrito a mano → número (o NaN). */
function parsePrice(text: string): number {
  return Number(text.trim().replace(',', '.').replace(/[^0-9.]/g, ''));
}

/** Catálogo inicial que se inserta desde el estado vacío. */
const SEED: { name: string; category: string; unitPrice: number; unit: string }[] = [
  { name: 'Consulta inicial y diagnóstico', category: 'Diagnóstico', unitPrice: 150, unit: 'consulta' },
  { name: 'Tomografía 3D', category: 'Diagnóstico', unitPrice: 300, unit: 'estudio' },
  { name: 'Limpieza completa', category: 'Preventivo', unitPrice: 150, unit: 'sesión' },
  { name: 'Extracción de pieza', category: 'Cirugía', unitPrice: 120, unit: 'pieza' },
  { name: 'Implante dental (titanio)', category: 'Implantes', unitPrice: 2000, unit: 'unidad' },
  { name: 'Corona de zirconio', category: 'Prótesis', unitPrice: 1800, unit: 'unidad' },
  { name: 'Prótesis híbrida', category: 'Prótesis', unitPrice: 3200, unit: 'unidad' },
  { name: 'Prótesis removible', category: 'Prótesis', unitPrice: 1200, unit: 'unidad' },
];

type FormState = {
  name: string;
  category: string;
  price: string;
  unit: string;
  active: boolean;
};

const EMPTY_FORM: FormState = { name: '', category: '', price: '', unit: 'unidad', active: true };

export default function AdminScreen() {
  const { role, loading: authLoading } = useAuth();

  // Mientras resolvemos la sesión, placeholder (no decidimos acceso a ciegas).
  if (authLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={palette.primary} />
      </SafeAreaView>
    );
  }
  // Guardia de rol: solo admin.
  if (role !== 'admin') {
    return <Redirect href={'/home' as any} />;
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const router = useRouter();
  const { procedures, loading, error, reload } = useProcedures();

  const [query, setQuery] = useState('');

  // Modal de crear/editar.
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Carga de catálogo de ejemplo.
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(0);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  // --- Filtro + agrupación por categoría (cliente) ---
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? procedures.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.category ?? '').toLowerCase().includes(q),
        )
      : procedures;

    const map = new Map<string, Procedure[]>();
    for (const p of filtered) {
      const key = p.category?.trim() || NO_CATEGORY;
      const arr = map.get(key);
      if (arr) arr.push(p);
      else map.set(key, [p]);
    }
    // Ordenamos alfabéticamente, dejando "Sin categoría" al final.
    return [...map.entries()].sort(([a], [b]) => {
      if (a === NO_CATEGORY) return 1;
      if (b === NO_CATEGORY) return -1;
      return a.localeCompare(b, 'es');
    });
  }, [procedures, query]);

  const activeCount = procedures.filter((p) => p.active).length;

  // --- Acciones ---
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Procedure) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category ?? '',
      price: String(p.unitPrice),
      unit: p.unit,
      active: p.active,
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      setSaveError('Ingresá un nombre para el ítem.');
      return;
    }
    const price = parsePrice(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setSaveError('El precio unitario tiene que ser un número mayor a 0.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const input = {
        name,
        category: form.category.trim() || null,
        unitPrice: price,
        unit: form.unit.trim() || 'unidad',
        active: form.active,
      };
      if (editingId) await updateProcedure(editingId, input);
      else await createProcedure(input);
      setModalOpen(false);
      reload();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'No se pudo guardar el ítem.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p: Procedure) => {
    Alert.alert(
      'Borrar ítem',
      `¿Seguro que querés borrar "${p.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProcedure(p.id);
              reload();
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'No se pudo borrar el ítem.',
              );
            }
          },
        },
      ],
    );
  };

  const loadSeed = async () => {
    setSeeding(true);
    setSeedDone(0);
    try {
      for (const item of SEED) {
        await createProcedure(item);
        setSeedDone((n) => n + 1);
      }
      reload();
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'No se pudieron cargar los precios de ejemplo.',
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand
        title="Administración"
        subtitle="Lista de precios"
        onBack={() => router.back()}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agregar ítem"
            hitSlop={8}
            onPress={openCreate}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
            <Ionicons name="add" size={24} color={palette.white} />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        {/* Fila resumen */}
        <Reveal index={0}>
          <View style={styles.summaryRow}>
            <SummaryStat value={String(procedures.length)} label="Ítems totales" />
            <View style={styles.summaryDivider} />
            <SummaryStat value={String(activeCount)} label="Activos" />
            <View style={styles.summaryDivider} />
            <SummaryStat value={CURRENCY} label="Moneda" />
          </View>
        </Reveal>

        {/* Buscador */}
        {procedures.length > 0 && (
          <Reveal index={1}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={palette.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre o categoría…"
                placeholderTextColor={palette.textMuted}
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar búsqueda"
                  hitSlop={8}
                  onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={palette.textMuted} />
                </Pressable>
              )}
            </View>
          </Reveal>
        )}

        {/* Estados */}
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.stateText}>Cargando lista de precios…</Text>
          </View>
        ) : error ? (
          <Card style={styles.errorCard} padded="xl">
            <Ionicons name="alert-circle-outline" size={28} color={palette.danger} />
            <Text style={styles.errorTitle}>No pudimos cargar los precios</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <Button label="Reintentar" variant="secondary" onPress={reload} />
          </Card>
        ) : procedures.length === 0 ? (
          <EmptyState seeding={seeding} done={seedDone} total={SEED.length} onSeed={loadSeed} />
        ) : groups.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="search-outline" size={28} color={palette.textMuted} />
            <Text style={styles.stateText}>Sin resultados para “{query.trim()}”.</Text>
          </View>
        ) : (
          groups.map(([category, items], gi) => (
            <Reveal index={2 + gi} key={category} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{category}</Text>
                <Text style={styles.groupCount}>{items.length}</Text>
              </View>
              <Card padded={false} style={styles.groupCard}>
                {items.map((p, i) => (
                  <PriceRow
                    key={p.id}
                    item={p}
                    first={i === 0}
                    onEdit={() => openEdit(p)}
                    onDelete={() => confirmDelete(p)}
                  />
                ))}
              </Card>
            </Reveal>
          ))
        )}
      </ScrollView>

      {/* Modal crear / editar */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingId ? 'Editar ítem' : 'Nuevo ítem'}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                hitSlop={8}
                onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color={palette.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetBody}>
              <Field label="Nombre">
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(t) => patch({ name: t })}
                  placeholder="Ej. Implante dental (titanio)"
                  placeholderTextColor={palette.textMuted}
                />
              </Field>

              <Field label="Categoría">
                <TextInput
                  style={styles.input}
                  value={form.category}
                  onChangeText={(t) => patch({ category: t })}
                  placeholder="Ej. Implantes (opcional)"
                  placeholderTextColor={palette.textMuted}
                />
              </Field>

              <View style={styles.fieldRow}>
                <Field label="Precio unitario" style={styles.fieldFlex}>
                  <View style={styles.priceInputWrap}>
                    <Text style={styles.pricePrefix}>$</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={form.price}
                      onChangeText={(t) => patch({ price: t })}
                      placeholder="0"
                      placeholderTextColor={palette.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </Field>
                <Field label="Unidad" style={styles.fieldFlex}>
                  <TextInput
                    style={styles.input}
                    value={form.unit}
                    onChangeText={(t) => patch({ unit: t })}
                    placeholder="unidad"
                    placeholderTextColor={palette.textMuted}
                  />
                </Field>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>Activo</Text>
                  <Text style={styles.switchHint}>Los ítems inactivos no se ofrecen en presupuestos.</Text>
                </View>
                <Switch
                  value={form.active}
                  onValueChange={(v) => patch({ active: v })}
                  trackColor={{ false: palette.border, true: palette.primaryLight }}
                  thumbColor={form.active ? palette.primary : palette.surface}
                />
              </View>

              {saveError && (
                <View style={styles.formError}>
                  <Ionicons name="alert-circle" size={16} color={palette.danger} />
                  <Text style={styles.formErrorText}>{saveError}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Button
                label={editingId ? 'Guardar cambios' : 'Crear ítem'}
                loading={saving}
                onPress={save}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/** Métrica de la fila resumen. */
function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

/** Fila de un ítem del catálogo dentro de una card de categoría. */
function PriceRow({
  item,
  first,
  onEdit,
  onDelete,
}: {
  item: Procedure;
  first: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.row, !first && styles.rowBorder, !item.active && styles.rowInactive]}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.rowMeta}>
          <Text style={styles.rowUnit}>/ {item.unit}</Text>
          {!item.active && <Badge label="Inactivo" tone="neutral" />}
        </View>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.rowPrice}>{formatPrice(item.unitPrice)}</Text>
        <View style={styles.rowActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${item.name}`}
            hitSlop={6}
            onPress={onEdit}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
            <Ionicons name="pencil" size={16} color={palette.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Borrar ${item.name}`}
            hitSlop={6}
            onPress={onDelete}
            style={({ pressed }) => [styles.iconBtn, styles.iconBtnDanger, pressed && styles.iconBtnPressed]}>
            <Ionicons name="trash-outline" size={16} color={palette.danger} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Estado vacío honesto con acción para sembrar el catálogo inicial. */
function EmptyState({
  seeding,
  done,
  total,
  onSeed,
}: {
  seeding: boolean;
  done: number;
  total: number;
  onSeed: () => void;
}) {
  return (
    <Reveal index={1}>
      <Card style={styles.emptyCard} padded="2xl">
        <View style={styles.emptyIcon}>
          <Ionicons name="pricetags-outline" size={30} color={palette.primary} />
        </View>
        <Text style={styles.emptyTitle}>Todavía no hay precios cargados</Text>
        <Text style={styles.emptyText}>
          Creá tu primer ítem con el botón + de arriba, o cargá un catálogo de ejemplo para
          empezar y editarlo después.
        </Text>
        <Button
          label={seeding ? `Cargando… ${done}/${total}` : 'Cargar precios de ejemplo'}
          variant="secondary"
          loading={seeding}
          disabled={seeding}
          onPress={onSeed}
        />
      </Card>
    </Reveal>
  );
}

/** Campo de formulario con label arriba. */
function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: CONTENT_BOTTOM_INSET,
  },

  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },

  // Resumen
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.lg,
    ...shadow.card,
  },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryValue: { ...typography.h2, color: palette.textPrimary },
  summaryLabel: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, alignSelf: 'stretch', marginVertical: spacing.sm, backgroundColor: palette.border },

  // Buscador
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 46,
    marginTop: spacing.lg,
  },
  searchInput: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: 0 },

  // Estados
  stateBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['4xl'] },
  stateText: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },

  errorCard: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  errorTitle: { ...typography.title, color: palette.textPrimary, textAlign: 'center' },
  errorMsg: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },

  // Grupos
  group: { marginTop: spacing.xl },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  groupTitle: { ...typography.label, color: palette.textSecondary, textTransform: 'uppercase' },
  groupCount: {
    ...typography.small,
    fontWeight: '700',
    color: palette.textMuted,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  groupCard: { overflow: 'hidden' },

  // Fila de ítem
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: palette.border },
  rowInactive: { backgroundColor: palette.surfaceAlt, opacity: 0.7 },
  rowMain: { flex: 1, gap: 2 },
  rowName: { ...typography.bodyStrong, color: palette.textPrimary },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowUnit: { ...typography.caption, color: palette.textMuted },
  rowRight: { alignItems: 'flex-end', gap: spacing.sm },
  rowPrice: { ...typography.subtitle, color: palette.navy, fontWeight: '800' },
  rowActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primarySoft,
  },
  iconBtnDanger: { backgroundColor: palette.dangerSoft },
  iconBtnPressed: { opacity: 0.6 },

  // Estado vacío
  emptyCard: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.title, color: palette.textPrimary, textAlign: 'center' },
  emptyText: { ...typography.body, color: palette.textSecondary, textAlign: 'center', marginBottom: spacing.sm },

  // Modal / hoja
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingBottom: spacing.xl,
    maxHeight: '90%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
    marginTop: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitle: { ...typography.h2, color: palette.textPrimary },
  sheetBody: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
  sheetFooter: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },

  // Campos
  field: { gap: spacing.sm },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  fieldFlex: { flex: 1 },
  fieldLabel: { ...typography.label, color: palette.textSecondary, textTransform: 'uppercase' },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: palette.textPrimary,
  },
  priceInputWrap: { position: 'relative', justifyContent: 'center' },
  pricePrefix: {
    position: 'absolute',
    left: spacing.lg,
    ...typography.body,
    color: palette.textSecondary,
    zIndex: 1,
  },
  priceInput: { paddingLeft: spacing.lg + 14 },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  switchText: { flex: 1, gap: 2 },
  switchTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  switchHint: { ...typography.caption, color: palette.textMuted },

  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  formErrorText: { ...typography.caption, color: palette.danger, flex: 1 },
});
