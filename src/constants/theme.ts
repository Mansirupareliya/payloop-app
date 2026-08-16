export const Typography = {
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
  },
  weight: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  20,
  xl:  24,
  '2xl': 32,
  '3xl': 48,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  blue: {
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.30,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
};
