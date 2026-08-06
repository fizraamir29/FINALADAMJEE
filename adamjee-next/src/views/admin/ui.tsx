'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Check as CheckIcon, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Search, X } from 'lucide-react';
import { ADMIN, PILL, PillTone } from './theme';

/**
 * Shared admin UI primitives, matching the Fixoria reference.
 * Every admin screen composes these rather than re-styling raw elements.
 */

// ─── Page header ────────────────────────────────────────────────────────────
/**
 * Actions row for a page. The page name itself lives in the top bar (as in the
 * reference), so this renders nothing when a screen has no actions.
 */
export function PageHeader({
  actions,
}: {
  title?: string;
  actions?: React.ReactNode;
}) {
  if (!actions) return null;
  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 mb-5">
      {actions}
    </div>
  );
}

// ─── Buttons ────────────────────────────────────────────────────────────────
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ElementType;
};

export function Btn({ variant = 'secondary', icon: Icon, children, className = '', ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 h-11 px-[18px] rounded-[12px] text-[15px] font-semibold ' +
    'transition-all duration-200 ease-out active:scale-[0.97] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants: Record<string, string> = {
    primary:   'bg-[#5B32F0] hover:bg-[#4A25CE] text-white border border-transparent shadow-[0_1px_2px_rgba(16,16,26,0.08)] hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] hover:-translate-y-px',
    secondary: 'bg-white hover:bg-[#F7F7F9] hover:border-[#DCDCE3] text-[#16161A] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] hover:shadow-[0_2px_8px_rgba(16,16,26,0.08)] hover:-translate-y-px',
    ghost:     'bg-transparent hover:bg-[#F1F1F4] text-[#6E6E78] border border-transparent',
    danger:    'bg-[#DC2626] hover:bg-[#B91C1C] text-white border border-transparent hover:shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:-translate-y-px',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {Icon && <Icon className="w-[17px] h-[17px]" strokeWidth={2} />}
      {children}
    </button>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padded = false, hover = true }: { children: React.ReactNode; className?: string; padded?: boolean; hover?: boolean }) {
  return (
    <div
      className={`bg-white border border-[#E8E8EC] rounded-[20px] shadow-[0_1px_2px_rgba(16,16,26,0.04)] ${hover ? 'admin-card-hover' : ''} ${padded ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Search field ───────────────────────────────────────────────────────────
export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-[18px] pr-11 rounded-[12px] border border-[#E8E8EC] bg-white text-[15px] text-[#16161A]
                   placeholder:text-[#9A9AA5] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition"
      />
      <Search className="w-[17px] h-[17px] text-[#6E6E78] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ─── Dropdown-style filter pill ─────────────────────────────────────────────
export function FilterPill({
  label,
  icon: Icon,
  onClick,
  active = false,
  chevron = true,
}: {
  label: string;
  icon?: React.ElementType;
  onClick?: () => void;
  active?: boolean;
  chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border text-[15px] font-medium transition-all duration-200 ease-out active:scale-[0.97] cursor-pointer
        ${active
          ? 'border-[#5B32F0] text-[#5B32F0] bg-[#F7F4FE]'
          : 'border-[#E8E8EC] text-[#16161A] bg-white hover:bg-[#F7F7F9]'}`}
    >
      {Icon && <Icon className="w-[17px] h-[17px] text-[#6E6E78]" strokeWidth={2} />}
      {label}
      {chevron && <ChevronDown className="w-4 h-4 text-[#6E6E78]" strokeWidth={2.2} />}
    </button>
  );
}

/** Native select styled to match FilterPill. */
export function SelectPill({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="has-chevron appearance-none h-11 pl-4 pr-10 rounded-[12px] border border-[#E8E8EC] bg-white
                   text-[15px] font-medium text-[#16161A] outline-none cursor-pointer hover:bg-[#F7F7F9]
                   focus:border-[#5B32F0] hover:border-[#DCDCE3] transition-all duration-200"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-[#6E6E78] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.2} />
    </div>
  );
}

// ─── Status pill ────────────────────────────────────────────────────────────
export function StatusPill({
  label,
  tone = 'gray',
  onClick,
  chevron = false,
}: {
  label: string;
  tone?: PillTone;
  onClick?: () => void;
  chevron?: boolean;
}) {
  const c = PILL[tone];
  return (
    <span
      onClick={onClick}
      style={{ backgroundColor: c.bg, color: c.fg }}
      className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[14px] font-semibold capitalize whitespace-nowrap
        ${onClick ? 'cursor-pointer hover:brightness-95 hover:scale-[1.03] transition-all duration-200' : ''}`}
    >
      {label}
      {chevron && <ChevronDown className="w-3.5 h-3.5 opacity-70" strokeWidth={2.5} />}
    </span>
  );
}

// ─── Zoomed-panel geometry ──────────────────────────────────────────────────
/**
 * The panel is drawn with CSS `zoom` (see `--admin-zoom` in globals.css), which
 * puts three coordinate spaces in play: *local* px that CSS lengths are written
 * in, *screen* px that `window.innerWidth/Height` report, and whatever
 * `getBoundingClientRect()` chooses — browsers differ on whether client rects
 * come back zoomed. Measure that once with a probe of known local width rather
 * than assume, then convert rects into local px, which is what a style attribute
 * on a zoomed element expects.
 */
let clientPerLocal: number | null = null;

function rectScale(inZoomedSubtree: Element): number {
  if (clientPerLocal !== null) return clientPerLocal;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;left:0;width:100px;height:0;visibility:hidden;pointer-events:none';
  (inZoomedSubtree.parentElement ?? inZoomedSubtree).appendChild(probe);
  clientPerLocal = probe.getBoundingClientRect().width / 100 || 1;
  probe.remove();
  return clientPerLocal;
}

/** Effective zoom on `el`, read from the custom property the panel sets. */
function zoomOf(el: Element): number {
  const v = parseFloat(getComputedStyle(el).getPropertyValue('--admin-zoom'));
  return v > 0 ? v : 1;
}

/**
 * Inline status editor.
 *
 * A native <select> hands the list to the OS, which ignores the panel's styling
 * entirely. This renders its own menu instead: the pill is the trigger, and the
 * options appear in a floating card with a colour swatch per state and a tick on
 * the current one. The menu is portalled to <body> and positioned from the
 * trigger's rect, because the table scrolls horizontally and would otherwise
 * clip it.
 */
export function StatusSelect({
  value,
  tone,
  options,
  onChange,
}: {
  value: string;
  tone: PillTone;
  options: { value: string; label: string; tone?: PillTone }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; align: 'left' | 'right' } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const c = PILL[tone];
  const current = options.find(o => o.value === value);
  const MENU_W = 196;

  const place = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    // Everything below is in local px: the trigger's rect converted out of
    // client space, and the viewport converted out of screen space. Both are a
    // no-op when the panel isn't zoomed.
    const s = rectScale(el);
    const z = zoomOf(el);
    const c = el.getBoundingClientRect();
    const r = { top: c.top / s, bottom: c.bottom / s, left: c.left / s, right: c.right / s };
    const vw = window.innerWidth / z;
    const vh = window.innerHeight / z;

    const estH = options.length * 38 + 12;
    const below = vh - r.bottom;
    const top = below < estH + 12 && r.top > estH + 12 ? r.top - estH - 6 : r.bottom + 6;
    // Flip to right-alignment when the menu would run off the viewport.
    const overflowsRight = r.left + MENU_W > vw - 12;
    setPos({
      top,
      left: overflowsRight ? r.right - MENU_W : r.left,
      align: overflowsRight ? 'right' : 'left',
    });
  }, [options.length]);

  React.useEffect(() => {
    if (!open) return;
    place();
    const close = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    // Reposition rather than drift when the page moves underneath.
    const reflow = () => place();
    document.addEventListener('mousedown', close);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reflow);
      window.removeEventListener('scroll', reflow, true);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ backgroundColor: c.bg, color: c.fg }}
        className="inline-flex items-center gap-1.5 h-8 pl-3.5 pr-3 rounded-full text-[14px] font-semibold
                   capitalize whitespace-nowrap cursor-pointer hover:brightness-95 active:scale-[0.97]
                   transition-all duration-200"
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.fg }} />
        {current?.label ?? value}
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>

      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{ top: pos.top, left: pos.left, width: MENU_W }}
          className="admin-scope fixed z-[9999] p-1.5 bg-white rounded-[14px] border border-[#EDEDF0]
                     shadow-[0_12px_32px_-8px_rgba(11,11,18,0.22)] animate-[adminPop_160ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          {options.map(o => {
            const oc = PILL[o.tone ?? 'gray'];
            const active = o.value === value;
            return (
              <button
                key={o.value}
                role="option"
                aria-selected={active}
                onClick={e => { e.stopPropagation(); setOpen(false); if (!active) onChange(o.value); }}
                className={`w-full h-10 px-3 rounded-[10px] flex items-center gap-3 text-[14.5px] text-left
                            transition-colors duration-150 cursor-pointer
                            ${active ? 'bg-[#F7F7F9] font-semibold text-[#16161A]' : 'font-medium text-[#4A4A55] hover:bg-[#F7F7F9]'}`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: oc.fg }} />
                <span className="flex-1 truncate capitalize">{o.label}</span>
                {active && <CheckIcon className="w-4 h-4 text-[#5B32F0] flex-shrink-0" strokeWidth={2.6} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Table ──────────────────────────────────────────────────────────────────
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-left [&>tbody]:admin-rows">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className = '',
  sortable = false,
  onSort,
  width,
}: {
  children?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  onSort?: () => void;
  width?: number | string;
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className={`bg-[#FAFAFB] h-14 px-6 text-[15px] font-semibold text-[#4A4A55] whitespace-nowrap
                  border-y border-[#E8E8EC] first:rounded-l-none ${className}`}
    >
      {sortable ? (
        <button onClick={onSort} className="inline-flex items-center gap-1.5 hover:text-[#16161A] transition-colors cursor-pointer">
          {children}
          <ChevronDown className="w-4 h-4 text-[#9A9AA5]" strokeWidth={2.2} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 border-b border-[#F0F0F3] text-[15px] text-[#16161A] align-middle ${className}`}>
      {children}
    </td>
  );
}

export function Tr({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tr style={{ height: ADMIN.rowHeight }} className={`hover:bg-[#FAFAFB] transition-colors duration-200 ease-out ${className}`}>
      {children}
    </tr>
  );
}

/** Square checkbox matching the reference. */
export function Check({
  checked,
  onChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  'aria-label'?: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label={ariaLabel}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="w-5 h-5 rounded-[6px] border-[1.5px] border-[#D2D2DA] text-[#5B32F0]
                 accent-[#5B32F0] cursor-pointer align-middle"
    />
  );
}

/** Row action "…" button. */
export function RowActions({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Row actions"
      className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                 hover:bg-[#F1F1F4] hover:text-[#16161A] transition-all duration-200 active:scale-90 cursor-pointer"
    >
      <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2.2} />
    </button>
  );
}

/** Product/entity cell: thumbnail + name. */
export function EntityCell({
  image,
  name,
  sub,
  fallback,
}: {
  image?: string;
  name: string;
  sub?: string;
  fallback?: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="admin-zoom w-12 h-12 rounded-xl bg-[#F4F4F6] border border-[#EDEDF0] flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={e => { if (fallback) (e.target as HTMLImageElement).src = fallback; }}
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-[#16161A] truncate">{name}</p>
        {sub && <p className="text-[13.5px] text-[#9A9AA5] truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-24 px-8 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#F4F4F6] flex items-center justify-center mx-auto mb-5">
          <Icon className="w-6 h-6 text-[#9A9AA5]" strokeWidth={1.8} />
        </div>
      )}
      <p className="text-[17px] font-semibold text-[#16161A] mb-1">{title}</p>
      {description && <p className="text-[15px] text-[#6E6E78] max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// ─── Pagination ─────────────────────────────────────────────────────────────
export function Pagination({
  page,
  pageCount,
  total,
  perPage,
  onPage,
  onPerPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
  onPerPage?: (n: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // 1 … n window with ellipsis, mirroring the reference (1 2 3 … 12)
  const pages: (number | '…')[] = [];
  if (pageCount <= 6) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else if (page <= 3) {
    pages.push(1, 2, 3, '…', pageCount);
  } else if (page >= pageCount - 2) {
    pages.push(1, '…', pageCount - 2, pageCount - 1, pageCount);
  } else {
    pages.push(1, '…', page, '…', pageCount);
  }

  const boxCls =
    'min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-[10px] border text-[15px] font-semibold transition-all duration-200 ease-out active:scale-95 cursor-pointer';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
      <div className="flex items-center gap-3">
        <span className="text-[15px] text-[#6E6E78]">
          Result {from}-{to} of {total}
        </span>
        {onPerPage && (
          <SelectPill
            value={String(perPage)}
            onChange={v => onPerPage(Number(v))}
            options={[10, 20, 50, 100].map(n => ({ value: String(n), label: String(n) }))}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className={`${boxCls} border-[#E8E8EC] bg-white text-[#16161A] hover:bg-[#F7F7F9] gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.2} /> Previous
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="min-w-9 h-9 inline-flex items-center justify-center text-[#9A9AA5] text-[15px]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`${boxCls} ${
                p === page
                  ? 'border-[#5B32F0] text-[#5B32F0] bg-white'
                  : 'border-[#E8E8EC] bg-white text-[#16161A] hover:bg-[#F7F7F9]'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          className={`${boxCls} border-[#E8E8EC] bg-white text-[#16161A] hover:bg-[#F7F7F9] gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Next <ChevronRight className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

/** Render outside the admin frame so fixed positioning resolves to the viewport. */
function portal(node: React.ReactNode) {
  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

// ─── Overlay surfaces ───────────────────────────────────────────────────────
/**
 * Two presentations behind one API:
 *
 *  • `drawer` — a floating panel inset from the right edge. Detail views and
 *    forms get room to breathe without covering the page behind them, and the
 *    reading position stays put as you move between records.
 *  • `center` — a compact centred dialog for confirmations, where the decision
 *    should be the only thing on screen.
 *
 * Structure is carried by spacing and a single hairline rather than boxed
 * headers: a soft tinted eyebrow, a large title, an airy body, and actions that
 * float above a blurred bar.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = 'md',
  footer,
  children,
  tone = 'default',
  variant,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
  variant?: 'drawer' | 'center';
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  // Confirmations read better centred; everything else slides in as a drawer.
  const mode = variant ?? (size === 'sm' || tone === 'danger' ? 'center' : 'drawer');
  const accent = tone === 'danger' ? '#DC2626' : '#5B32F0';
  const accentSoft = tone === 'danger' ? '#FDEEF0' : '#F1EDFE';

  const closeBtn = (
    <button
      onClick={onClose}
      aria-label="Close"
      className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#8A8A96]
                 hover:bg-[#F2F2F5] hover:text-[#16161A] hover:rotate-90 active:scale-90
                 transition-all duration-300 cursor-pointer flex-shrink-0"
    >
      <X className="w-[18px] h-[18px]" strokeWidth={2.2} />
    </button>
  );

  const backdrop = (
    <div
      className="absolute inset-0 bg-[#0B0B12]/35 backdrop-blur-[2px] animate-[adminFade_200ms_ease-out]"
      onClick={onClose}
    />
  );

  // ── Centred dialog ────────────────────────────────────────────────────────
  if (mode === 'center') {
    // A confirmation is a single decision, so it centres its content. Anything
    // larger is a reading surface and stays left-aligned with a scrolling body.
    const isPrompt = size === 'sm' || tone === 'danger';
    const centerPx: Record<string, number> = { sm: 440, md: 560, lg: 760, xl: 940, full: 1100 };

    // Sized against the full-viewport wrapper rather than in viewport units,
    // which the panel's zoom would shrink along with everything else — a tall
    // dialog should still be able to use the whole height of the screen.
    return portal(
      <div className="admin-scope fixed inset-0 z-[9998] flex items-center justify-center p-4">
        {backdrop}
        <div
          role="dialog"
          aria-modal="true"
          style={{ width: `min(100%, ${centerPx[size]}px)` }}
          className="admin-drawer relative max-h-full flex flex-col bg-white rounded-[24px] overflow-hidden
                     shadow-[0_32px_80px_-12px_rgba(11,11,18,0.35)]"
        >
          {isPrompt ? (
            <>
              <div className="px-8 pt-8 pb-6 text-center">
                {Icon && (
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                    style={{ background: accentSoft, color: accent }}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.9} />
                  </div>
                )}
                <h2 className="text-[21px] font-bold text-[#16161A] tracking-[-0.02em] leading-snug">{title}</h2>
                {subtitle && <p className="text-[15px] text-[#7A7A88] mt-2 leading-relaxed">{subtitle}</p>}
                <div className="mt-5 text-left">{children}</div>
              </div>
              {footer && (
                <div className="px-8 py-5 bg-[#FAFAFB] border-t border-[#F2F2F5] flex items-center justify-center gap-2.5 [&>button]:flex-1">
                  {footer}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />

              <div className="flex items-start gap-4 px-8 pt-7 pb-6 flex-shrink-0">
                {Icon && (
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: accentSoft, color: accent }}
                  >
                    <Icon className="w-[21px] h-[21px]" strokeWidth={1.9} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-[23px] font-bold text-[#16161A] tracking-[-0.025em] leading-tight truncate">{title}</h2>
                  {subtitle && <p className="text-[14.5px] text-[#8A8A96] mt-1 truncate">{subtitle}</p>}
                </div>
                {closeBtn}
              </div>

              <div className="mx-8 border-t border-[#F2F2F5] flex-shrink-0" />
              <div className="flex-1 overflow-y-auto px-8 py-7">{children}</div>

              {footer && (
                <div className="px-8 py-6 bg-white/85 backdrop-blur-md border-t border-[#F2F2F5] flex items-center justify-end gap-2.5 flex-shrink-0">
                  {footer}
                </div>
              )}
            </>
          )}

          {isPrompt && <div className="absolute top-4 right-4">{closeBtn}</div>}
        </div>
      </div>
    );
  }

  // ── Right-side drawer ─────────────────────────────────────────────────────
  const drawerPx: Record<string, number> = { sm: 420, md: 560, lg: 720, xl: 900, full: 1100 };

  return portal(
    <div className="admin-scope fixed inset-0 z-[9998]">
      {backdrop}
      <div
        role="dialog"
        aria-modal="true"
        style={{ top: 12, right: 12, bottom: 12, width: `min(calc(100% - 24px), ${drawerPx[size]}px)` }}
        className="admin-drawer absolute bg-white rounded-[24px] flex flex-col overflow-hidden
                   shadow-[0_32px_80px_-12px_rgba(11,11,18,0.4)]"
      >
        {/* Eyebrow accent */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />

        {/* Header — no boxed border; spacing does the separating */}
        <div className="flex items-start gap-4 px-8 pt-7 pb-6 flex-shrink-0">
          {Icon && (
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: accentSoft, color: accent }}
            >
              <Icon className="w-[21px] h-[21px]" strokeWidth={1.9} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[23px] font-bold text-[#16161A] tracking-[-0.025em] leading-tight truncate">{title}</h2>
            {subtitle && <p className="text-[14.5px] text-[#8A8A96] mt-1 truncate">{subtitle}</p>}
          </div>
          {closeBtn}
        </div>

        <div className="mx-8 border-t border-[#F2F2F5] flex-shrink-0" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-7">{children}</div>

        {/* Footer floats over the content it scrolls above */}
        {footer && (
          <div className="px-8 py-6 bg-white/85 backdrop-blur-md border-t border-[#F2F2F5]
                          flex items-center justify-end gap-2.5 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
/** Labelled form field for use inside modals. */
export function Field({
  label,
  hint,
  required,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[14px] font-semibold text-[#16161A] mb-1.5">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[13px] text-[#9A9AA5] mt-1">{hint}</p>}
    </div>
  );
}

/** Text input styled for admin modals and forms. */
export const inputCls =
  'w-full h-11 px-4 rounded-[12px] border border-[#E8E8EC] bg-white text-[15px] text-[#16161A] ' +
  'placeholder:text-[#9A9AA5] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 ' +
  'transition-all duration-150';

export const textareaCls = inputCls.replace('h-10', 'min-h-[96px] py-2.5');

// ─── Inventory filter rail ──────────────────────────────────────────────────
/** Collapsible filter section with a chevron, as in the inventory reference. */
export function FilterGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3.5 border-b border-[#F0F0F3] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group"
      >
        <span className="text-[14px] font-semibold text-[#16161A]">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#9A9AA5] transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          strokeWidth={2.2}
        />
      </button>
      {open && <div className="mt-2 space-y-0.5">{children}</div>}
    </div>
  );
}

/** Checkbox + label + count row inside a FilterGroup. */
export function FilterRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-[15px] h-[15px] rounded-[4px] border-[1.5px] border-[#D2D2DA] accent-[#5B32F0] cursor-pointer flex-shrink-0"
      />
      <span className={`flex-1 text-[14.5px] truncate transition-colors duration-200 ${checked ? 'text-[#16161A] font-medium' : 'text-[#6E6E78] group-hover:text-[#16161A]'}`}>
        {label}
      </span>
      {count !== undefined && <span className="text-[13.5px] text-[#9A9AA5] tabular-nums">{count}</span>}
    </label>
  );
}

/** Small metric chip used in the product detail panel. */
export function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#EDEDF0] bg-[#FAFAFB] px-2.5 py-3 text-center transition-all duration-200 hover:border-[#DCDCE3] hover:bg-white hover:shadow-[0_2px_8px_rgba(16,16,26,0.06)]">
      <Icon className="w-4 h-4 text-[#5B32F0] mx-auto mb-1" strokeWidth={2} />
      <p className="text-[14px] font-semibold text-[#16161A] leading-tight truncate">{value}</p>
      <p className="text-[13px] text-[#9A9AA5] leading-tight mt-0.5">{label}</p>
    </div>
  );
}

/** Accordion-style row in the detail panel. */
export function DetailRow({
  icon: Icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 py-3.5 px-2 -mx-2 rounded-xl text-left hover:bg-[#FAFAFB] transition-all duration-200 cursor-pointer group"
    >
      <div className="w-9 h-9 rounded-[10px] bg-[#F4F4F6] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#6E6E78]" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-medium text-[#16161A] truncate">{title}</p>
        {sub && <p className="text-[13px] text-[#9A9AA5] truncate">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-[#C4C4CE] group-hover:text-[#5B32F0] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" strokeWidth={2.2} />
    </button>
  );
}

// ─── Stock cell ─────────────────────────────────────────────────────────────
export function StockCell({ stock, threshold = 5 }: { stock: number; threshold?: number }) {
  if (stock <= 0) {
    return <span className="font-semibold text-[#DC2626]">Out of Stock</span>;
  }
  if (stock <= threshold) {
    return (
      <span>
        <span className="text-[#16161A]">{stock}</span>{' '}
        <span className="font-semibold text-[#D97706]">Low Stock</span>
      </span>
    );
  }
  return <span className="text-[#16161A]">{stock}</span>;
}

// ─── Charts ─────────────────────────────────────────────────────────────────
// Hand-rolled inline SVG: no chart dependency, no external requests, and every
// series is driven by real data passed in by the caller.

/** Smooth area sparkline used inside the KPI cards. */
export function Sparkline({
  data,
  tone = 'up',
  width = 120,
  height = 40,
}: {
  data: number[];
  tone?: 'up' | 'down';
  width?: number;
  height?: number;
}) {
  const id = React.useId();
  const pts = data.length > 1 ? data : [0, 0];
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const span = max - min || 1;

  const step = width / (pts.length - 1);
  const coords = pts.map((v, i) => [i * step, height - ((v - min) / span) * (height - 6) - 3]);

  // Catmull-Rom-ish smoothing for a soft curve.
  const line = coords.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`;
    const [px, py] = arr[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx},${py} ${cx},${y} ${x},${y}`;
  }, '');

  const stroke = tone === 'up' ? '#16A34A' : '#DC2626';
  const fill = tone === 'up' ? '#16A34A' : '#DC2626';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.22" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L ${width},${height} L 0,${height} Z`} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Grouped vertical bar chart (two series) for the sales-trend card. */
export function GroupedBars({
  labels,
  seriesA,
  seriesB,
  labelA,
  labelB,
  formatValue,
}: {
  labels: string[];
  seriesA: number[];
  seriesB: number[];
  labelA: string;
  labelB: string;
  formatValue: (n: number) => string;
}) {
  const max = Math.max(...seriesA, ...seriesB, 1);
  // Round the axis up to a friendly number.
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / mag) * mag || 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => top * f).reverse();

  return (
    <div className="flex gap-3">
      {/* Y axis */}
      <div className="flex flex-col justify-between h-[240px] text-[13.5px] text-[#9A9AA5] tabular-nums text-right pt-1 pb-6 flex-shrink-0">
        {ticks.map((t, i) => <span key={i}>{formatValue(t)}</span>)}
      </div>

      {/* Plot */}
      <div className="flex-1 min-w-0">
        <div className="relative h-[240px]">
          {/* gridlines */}
          <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
            {ticks.map((_, i) => <div key={i} className="border-t border-[#F0F0F3]" />)}
          </div>

          <div className="absolute inset-0 bottom-6 flex items-end justify-around gap-1">
            {labels.map((_, i) => (
              <div key={i} className="flex-1 flex items-end justify-center gap-[3px] h-full group">
                <div
                  className="w-[38%] max-w-[22px] rounded-t-[5px] bg-[#C9B8FB] transition-all duration-300 group-hover:bg-[#B49BF9]"
                  style={{ height: `${Math.max((seriesA[i] / top) * 100, 1)}%` }}
                  title={`${labelA}: ${formatValue(seriesA[i])}`}
                />
                <div
                  className="w-[38%] max-w-[22px] rounded-t-[5px] bg-[#5B32F0] transition-all duration-300 group-hover:bg-[#4A25CE]"
                  style={{ height: `${Math.max((seriesB[i] / top) * 100, 1)}%` }}
                  title={`${labelB}: ${formatValue(seriesB[i])}`}
                />
              </div>
            ))}
          </div>

          {/* X axis */}
          <div className="absolute left-0 right-0 bottom-0 flex justify-around">
            {labels.map((l, i) => (
              <span key={i} className="flex-1 text-center text-[13px] text-[#9A9AA5]">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Donut chart with a centred total. */
export function Donut({
  segments,
  centerValue,
  centerLabel,
  size = 190,
}: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 16;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1F4" strokeWidth="22" />
        {total > 0 && segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[24px] font-bold text-[#16161A] tabular-nums leading-tight">{centerValue}</span>
        <span className="text-[13px] text-[#9A9AA5]">{centerLabel}</span>
      </div>
    </div>
  );
}

/** Thin progress bar used in the top-products and inventory-alert lists. */
export function Meter({ pct, tone = 'violet' }: { pct: number; tone?: 'violet' | 'red' | 'amber' | 'green' }) {
  const colors: Record<string, string> = {
    violet: '#5B32F0', red: '#DC2626', amber: '#D97706', green: '#16A34A',
  };
  return (
    <div className="h-1.5 rounded-full bg-[#F1F1F4] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: colors[tone] }}
      />
    </div>
  );
}

/** Delta chip: "↑ 12.3%" green for up, red for down. */
export function DeltaChip({ value, suffix = 'vs yesterday' }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-0.5 h-6 px-2 rounded-full text-[13px] font-semibold
          ${up ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FDE7EA] text-[#DC2626]'}`}
      >
        {up ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
      </span>
      {suffix && <span className="text-[13px] text-[#9A9AA5]">{suffix}</span>}
    </div>
  );
}

/**
 * Headline metric card for the dashboard: a soft icon chip, a large figure, the
 * period-over-period delta, and a chart that bleeds to the card's bottom edge.
 */
export function StatCard({
  label,
  value,
  delta,
  data,
  icon: Icon,
  footnote,
  accent = '#5B32F0',
}: {
  label: string;
  value: string;
  delta?: number;
  data: number[];
  icon: React.ElementType;
  footnote?: string;
  accent?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="admin-card-hover group relative bg-white border border-[#E8E8EC] rounded-[20px]
                    shadow-[0_1px_2px_rgba(16,16,26,0.04)] overflow-hidden">
      <div className="p-7 pb-4">
        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="text-[14.5px] font-medium text-[#6E6E78]">{label}</span>
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                       transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${accent}14`, color: accent }}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
          </span>
        </div>

        <p className="text-[36px] leading-none font-bold text-[#16161A] tracking-[-0.03em] tabular-nums truncate">
          {value}
        </p>

        <div className="mt-3 flex items-center gap-2 min-h-[24px]">
          {delta !== undefined ? (
            <>
              <span
                className={`inline-flex items-center gap-0.5 h-6 px-2 rounded-full text-[13px] font-semibold
                  ${up ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FDE7EA] text-[#DC2626]'}`}
              >
                {up ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
              </span>
              <span className="text-[13.5px] text-[#9A9AA5]">{footnote ?? 'vs yesterday'}</span>
            </>
          ) : (
            <span className="text-[13.5px] text-[#9A9AA5]">{footnote}</span>
          )}
        </div>
      </div>

      {/* Chart bleeds to the edges so the card reads as one surface */}
      <AreaChart data={data} color={accent} height={56} />
    </div>
  );
}

/** Full-bleed smooth area chart used along the bottom of a StatCard. */
export function AreaChart({
  data,
  color = '#5B32F0',
  height = 56,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const id = React.useId();
  const pts = data.length > 1 ? data : [0, 0];
  const W = 300;
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const span = max - min || 1;
  const step = W / (pts.length - 1);
  const coords = pts.map((v, i) => [i * step, height - ((v - min) / span) * (height - 10) - 5]);

  const line = coords.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`;
    const [px, py] = arr[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx},${py} ${cx},${y} ${x},${y}`;
  }, '');

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className="w-full block"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={`${line} L ${W},${height} L 0,${height} Z`} fill={`url(#area-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Section heading used above dashboard cards. */
export function SectionTitle({
  title,
  subtitle,
  action,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="w-9 h-9 rounded-[10px] bg-[#F1EDFE] text-[#5B32F0] flex items-center justify-center flex-shrink-0">
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-[#16161A] tracking-[-0.01em]">{title}</p>
          {subtitle && <p className="text-[14px] text-[#9A9AA5] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
