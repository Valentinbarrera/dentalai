import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { palette, spacing } from '@/theme/tokens';

type ScreenContainerProps = {
  children: ReactNode;
  /** Si true, envuelve en ScrollView (default). Si false, layout fijo. */
  scroll?: boolean;
  /** Padding horizontal del contenido. Default: 20 */
  padded?: boolean;
  contentStyle?: ViewStyle;
  edges?: Edge[];
  /** Color de fondo. Default: background del tema */
  background?: string;
};

export function ScreenContainer({
  children,
  scroll = true,
  padded = true,
  contentStyle,
  edges = ['top'],
  background = palette.background,
}: ScreenContainerProps) {
  const inner: ViewStyle = {
    paddingHorizontal: padded ? spacing.xl : 0,
    paddingBottom: CONTENT_BOTTOM_INSET,
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={edges}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[inner, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
});
