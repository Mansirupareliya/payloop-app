export const Colors = {
  // ─── Core Monochrome ──────────────────────────────────────────────────────────
  deepNavy:      '#0A0A0A',   // Near-black — primary text, dark cards
  darkBlue:      '#1A1A1A',   // Dark surface — dark buttons, dark cards
  primary:       '#000000',   // Lime green — THE accent (only pop of color)
  lightBlue:     '#888888',   // Mid gray — secondary icons
  paleBlue:      '#F0F0F0',   // Light gray — tint backgrounds

  // ─── Aliases ──────────────────────────────────────────────────────────────────
  primaryLight:  '#E8FBAB',   // Light lime tint
  primaryDark:   '#1A1A1A',
  primaryGlow:   '#F3FDD3',   // Very faint lime background
  accent:        '#C8F135',   // Same as primary
  accentLight:   '#F3FDD3',

  // ─── Semantic ─────────────────────────────────────────────────────────────────
  success:       '#C8F135',   // Lime = positive/paid (matches brand)
  successLight:  '#F3FDD3',
  warning:       '#F5A623',   // Muted amber
  warningLight:  '#FEF3C7',
  danger:        '#E53E3E',   // Clean red
  dangerLight:   '#FFF0F0',
  info:          '#1A1A1A',
  infoLight:     '#F0F0F0',

  // ─── Backgrounds ──────────────────────────────────────────────────────────────
  background:    '#EFEFEF',   // Light gray — app background
  surface:       '#FFFFFF',   // Pure white — cards, sheets
  surfaceAlt:    '#F7F7F7',   // Off-white — input fills
  border:        '#E5E5E5',   // Subtle gray border
  borderLight:   '#F0F0F0',   // Lightest divider

  // ─── Text ─────────────────────────────────────────────────────────────────────
  textPrimary:   '#0A0A0A',   // Near-black headings & values
  textSecondary: '#555555',   // Mid gray — labels
  textMuted:     '#999999',   // Light gray — placeholders, hints
  textOnDark:    '#FFFFFF',   // White text on dark cards
  textOnDarkMuted: '#AAAAAA',

  // ─── Gradients ────────────────────────────────────────────────────────────────
  gradientPrimary: ['#1A1A1A', '#0A0A0A'],
  gradientDark:    ['#0A0A0A', '#1A1A1A'],
  gradientLight:   ['#F0F0F0', '#FFFFFF'],
  gradientSuccess: ['#C8F135', '#A8D400'],
  gradientWarning: ['#F5A623', '#E8940F'],
  gradientDanger:  ['#E53E3E', '#C53030'],
  gradientCard:    ['#1A1A1A', '#0A0A0A'],
  gradientGold:    ['#C8F135', '#A8D400'],

  // ─── Category Colors (muted, neutral-toned) ───────────────────────────────────
  catRent:          '#645ac7',   // Soft violet
  catElectricity:   '#E8960A',   // Warm amber
  catWater:         '#3B82F6',   // Clean blue
  catGas:           '#EF4444',   // Red
  catMobile:        '#22C55E',   // Green
  catInternet:      '#334155',   // Dark slate
  catCreditCard:    '#D97706',   // Dark amber
  catLoan:          '#EA580C',   // Orange
  catInsurance:     '#0D9488',   // Teal
  catEntertainment: '#A855F7',   // Purple
  catEducation:     '#2563EB',   // Blue
  catVehicle:       '#64748B',   // Slate gray
  catMaintenance:   '#78716C',   // Stone
  catShopping:      '#EC4899',   // Pink
  catOther:         '#9CA3AF',   // Cool gray
} as const;
