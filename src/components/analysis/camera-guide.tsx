import Svg, { Circle, Ellipse, Line } from 'react-native-svg';

import { palette } from '@/theme/tokens';

type CameraGuideProps = {
  width: number;
  height: number;
  color?: string;
};

/** Overlay de guía: óvalo punteado + círculo de enfoque + línea de escaneo. */
export function CameraGuide({ width, height, color = palette.teal }: CameraGuideProps) {
  if (width <= 0 || height <= 0) return null;

  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.min(width * 0.38, 150);
  const ry = Math.min(height * 0.32, 230);

  return (
    <Svg width={width} height={height} pointerEvents="none">
      {/* Línea de escaneo horizontal */}
      <Line x1={0} y1={cy} x2={width} y2={cy} stroke={color} strokeWidth={1.5} opacity={0.55} />
      {/* Óvalo guía punteado */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="6 9"
        fill="none"
      />
      {/* Círculo de enfoque central */}
      <Circle cx={cx} cy={cy} r={22} stroke={color} strokeWidth={1.5} fill="none" opacity={0.9} />
    </Svg>
  );
}
