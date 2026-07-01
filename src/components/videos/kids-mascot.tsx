import { StyleSheet, View } from 'react-native';

/** Denti — la mascota infantil (un dientito sonriente) dibujada con Views. */
export function KidsMascot({ size = 96 }: { size?: number }) {
  const s = size;
  const eye = { width: s * 0.1, height: s * 0.14, borderRadius: s * 0.06, backgroundColor: '#1E293B' };
  const cheek = { width: s * 0.13, height: s * 0.13, borderRadius: s * 0.065, backgroundColor: '#FBB6CE' };

  return (
    <View style={{ width: s * 0.92, height: s, alignItems: 'center' }}>
      {/* Cuerpo del diente */}
      <View
        style={[
          styles.body,
          {
            width: s * 0.92,
            height: s,
            borderTopLeftRadius: s * 0.46,
            borderTopRightRadius: s * 0.46,
            borderBottomLeftRadius: s * 0.26,
            borderBottomRightRadius: s * 0.26,
          },
        ]}
      />
      {/* Muesca inferior (separa las "raíces") */}
      <View style={[styles.notch, { width: s * 0.1, height: s * 0.22, bottom: 0, borderRadius: s * 0.05 }]} />

      {/* Ojos */}
      <View style={[eye, styles.eyeL, { top: s * 0.32, left: s * 0.24 }]} />
      <View style={[eye, styles.eyeR, { top: s * 0.32, right: s * 0.24 }]} />
      {/* Brillo en los ojos */}
      <View style={[styles.shine, { top: s * 0.34, left: s * 0.27 }]} />
      <View style={[styles.shine, { top: s * 0.34, right: s * 0.31 }]} />

      {/* Cachetes */}
      <View style={[cheek, styles.cheek, { top: s * 0.5, left: s * 0.14 }]} />
      <View style={[cheek, styles.cheek, { top: s * 0.5, right: s * 0.14 }]} />

      {/* Sonrisa */}
      <View
        style={[
          styles.smile,
          {
            top: s * 0.5,
            width: s * 0.28,
            height: s * 0.15,
            borderBottomLeftRadius: s * 0.14,
            borderBottomRightRadius: s * 0.14,
            borderBottomWidth: s * 0.035,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  notch: { position: 'absolute', backgroundColor: '#F1F5F9' },
  eyeL: { position: 'absolute' },
  eyeR: { position: 'absolute' },
  shine: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFFFFF' },
  cheek: { position: 'absolute', opacity: 0.85 },
  smile: {
    position: 'absolute',
    borderColor: '#1E293B',
    backgroundColor: 'transparent',
  },
});
