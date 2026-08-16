export const Colors = {
  // ─── Brand Blues (from design palette) ───────────────────────────────────────
  deepNavy:      '#001B48',   // Darkest — headers, dark sections
  darkBlue:      '#02457A',   // Dark — gradients, nav bg
  primary:       '#018ABE',   // Primary — buttons, highlights, icons
  lightBlue:     '#97CADB',   // Light — soft accents, tags, borders
  paleBlue:      '#D6E8EE',   // Lightest — backgrounds, card tints

  // Aliases for existing code compatibility
  primaryLight:  '#97CADB',
  primaryDark:   '#02457A',
  primaryGlow:   '#EAF4F8',
  accent:        '#018ABE',
  accentLight:   '#EAF4F8',

  // ─── Semantic ─────────────────────────────────────────────────────────────────
  success:       '#10B981',
  successLight:  '#D1FAE5',
  warning:       '#F59E0B',
  warningLight:  '#FEF3C7',
  danger:        '#EF4444',
  dangerLight:   '#FEE2E2',
  info:          '#018ABE',
  infoLight:     '#D6E8EE',

  // ─── Backgrounds ──────────────────────────────────────────────────────────────
  background:    '#F4F9FC',   // App bg — very light blue-white
  surface:       '#FFFFFF',
  surfaceAlt:    '#EAF4F8',
  border:        '#D6E8EE',
  borderLight:   '#EAF4F8',

  // ─── Text ─────────────────────────────────────────────────────────────────────
  textPrimary:   '#001B48',   // Use deep navy for primary text
  textSecondary: '#02457A',
  textMuted:     '#97CADB',
  textOnDark:    '#FFFFFF',
  textOnDarkMuted: '#D6E8EE',

  // ─── Gradients ────────────────────────────────────────────────────────────────
  gradientPrimary: ['#018ABE', '#02457A'],
  gradientDark:    ['#001B48', '#02457A'],
  gradientLight:   ['#97CADB', '#D6E8EE'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientWarning: ['#F59E0B', '#D97706'],
  gradientDanger:  ['#EF4444', '#DC2626'],
  gradientCard:    ['#018ABE', '#02457A'],

  // ─── Category Colors ──────────────────────────────────────────────────────────
  catRent:          '#8B5CF6',
  catElectricity:   '#F59E0B',
  catWater:         '#018ABE',
  catGas:           '#EF4444',
  catMobile:        '#10B981',
  catInternet:      '#02457A',
  catCreditCard:    '#EAB308',
  catLoan:          '#F97316',
  catInsurance:     '#14B8A6',
  catEntertainment: '#A855F7',
  catEducation:     '#3B82F6',
  catVehicle:       '#64748B',
  catMaintenance:   '#78716C',
  catShopping:      '#F43F5E',
  catOther:         '#97CADB',
} as const;
