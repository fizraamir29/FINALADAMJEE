/**
 * Admin design tokens.
 *
 * Derived from the Fixoria products-list reference: a white sidebar, a light
 * neutral canvas, white content cards with generous radii, one violet accent,
 * and tinted status pills. Every admin surface should pull its values from here
 * so the panel reads as one system.
 */

export const ADMIN = {
  // ── Layout ──────────────────────────────────────────────────────────────
  sidebarWidth: 280,
  topbarHeight: 92,
  pagePadding: 32,
  rowHeight: 76,

  radius: {
    control: 12,   // buttons, inputs, dropdown pills
    card: 20,      // content cards
    thumb: 8,      // product thumbnails
  },

  // ── Colour ──────────────────────────────────────────────────────────────
  color: {
    primary: '#5B32F0',
    primaryHover: '#4A25CE',
    primarySoft: '#EFEAFE',

    canvas: '#F6F6F7',
    surface: '#FFFFFF',
    sidebar: '#FFFFFF',
    tableHead: '#FAFAFB',
    hover: '#F7F7F9',

    border: '#E8E8EC',
    borderStrong: '#DCDCE3',

    text: '#16161A',
    textMuted: '#6E6E78',
    textFaint: '#9A9AA5',
  },
} as const;

/** Status pill palettes — background / foreground pairs. */
export const PILL = {
  green:  { bg: '#DCFCE7', fg: '#16A34A' },
  gray:   { bg: '#F1F2F4', fg: '#5A5A66' },
  red:    { bg: '#FDE7EA', fg: '#DC2626' },
  amber:  { bg: '#FEF6DC', fg: '#B45309' },
  violet: { bg: '#EFEAFE', fg: '#5B32F0' },
  blue:   { bg: '#E3F0FF', fg: '#1D6FD0' },
} as const;

export type PillTone = keyof typeof PILL;

/** Map a product publish/stock status to a pill tone + label. */
export function productStatusTone(status: string): PillTone {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'published') return 'green';
  if (s === 'draft') return 'gray';
  if (s === 'inactive' || s === 'archived') return 'red';
  if (s === 'stock out' || s === 'out of stock') return 'amber';
  return 'gray';
}

/** Map an order status to a pill tone. */
export function orderStatusTone(status: string): PillTone {
  switch ((status || '').toLowerCase()) {
    case 'delivered': return 'green';
    case 'shipped':   return 'blue';
    case 'processing':return 'violet';
    case 'pending':   return 'amber';
    case 'cancelled':
    case 'refunded':  return 'red';
    default:          return 'gray';
  }
}

/** Map a payment status to a pill tone. */
export function paymentStatusTone(status: string): PillTone {
  switch ((status || '').toLowerCase()) {
    case 'paid':     return 'green';
    case 'pending':  return 'amber';
    case 'failed':   return 'red';
    case 'refunded': return 'gray';
    default:         return 'gray';
  }
}
