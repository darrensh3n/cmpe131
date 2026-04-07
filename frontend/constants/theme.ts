// SJSU Spartan Marketplace — Design Tokens

export const Colors = {
  // SJSU Brand
  blue: '#0055A2',
  blueDark: '#003D7A',
  blueLight: '#1A6FBF',
  gold: '#E5A823',
  goldLight: '#F0C050',
  goldDark: '#C48A0A',

  // Surfaces
  white: '#FFFFFF',
  offWhite: '#F5F7FA',
  border: '#DDE3ED',

  // Text
  textPrimary: '#0A1628',
  textSecondary: '#5A6A85',
  textMuted: '#9AAABE',

  // Status
  error: '#D63B3B',
  success: '#2E7D55',

  // Glass / transparency
  glassBlue: 'rgba(0, 85, 162, 0.13)',
  glassBorder: 'rgba(255, 255, 255, 0.45)',
  whiteAlpha60: 'rgba(255, 255, 255, 0.60)',
  whiteAlpha15: 'rgba(255, 255, 255, 0.15)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: Colors.blueDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
};
