import { Platform } from 'react-native';

export const COLORS = {
  // Surfaces
  bg: '#0B0C10',
  card: '#16181D',
  card2: '#1C1F26',
  border: '#2A2E37',

  // Text
  text: '#F4F4F5',
  muted: '#A1A1AA',
  subtle: '#71717A',

  // Accent
  accent: '#C7A24B',
  accentDim: '#8B7033',
  accentSoft: '#E2C77A',

  // Semantic
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Utility
  overlay: 'rgba(0,0,0,0.6)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FONTS = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }),
  body: Platform.select({ ios: 'System', default: 'sans-serif' }),
} as const;

export const TYPE = {
  displayLarge: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: '800' as const,
    color: COLORS.text,
  },
  displayMedium: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: COLORS.muted,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: COLORS.subtle,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    color: COLORS.text,
  },
} as const;
