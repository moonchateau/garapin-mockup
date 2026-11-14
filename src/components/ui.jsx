import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Info, Star } from 'lucide-react'
import { useStore } from '../store/AppStore'

export function TopBar({ title, back = true, right, variant, onBack, backTo }) {
  const nav = useNavigate()
  const goBack = () => {
    if (onBack) return onBack()
    if (backTo) return nav(backTo)
    if (window.history.state?.idx > 0) nav(-1)
    else nav('/')
  }
  return (
    <header className={`topbar ${variant || ''}`}>
      {back && (
        <button className={`icon-btn ${variant === 'clear' ? 'solid' : ''}`} onClick={goBack} aria-label="Kembali">
          <ArrowLeft size={21} />
        </button>
      )}
      <h1 style={{ paddingLeft: back ? 0 : 6 }}>{title}</h1>
      {right}
    </header>
  )
}

export function Avatar({ name = '?', color = '#5B3DF5', size = 40, square }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className={`avatar ${square ? 'sq' : ''}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.38, borderRadius: square ? size * 0.3 : undefined }}
    >
      {initials}
    </div>
  )
}

export function Stars({ value = 0, size = 14, onChange, large }) {
  return (
    <span className={`stars ${large ? 'lg' : ''}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= Math.round(value)
        const icon = <Star size={size} fill={on ? 'currentColor' : 'none'} strokeWidth={on ? 0 : 1.8} color={on ? undefined : '#cfd2e3'} />
        return onChange ? (
          <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i} bintang`}>
            {icon}
          </button>
        ) : (
          <span key={i}>{icon}</span>
        )
      })}
    </span>
  )
}

export function ProgressBar({ value, max = 100, variant = '', thin }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100))
  return (
    <div className={`bar ${variant} ${thin ? 'thin' : ''}`}>
      <i style={{ width: pct + '%' }} />
    </div>
  )
}

export function Ring({ value, max = 100, size = 120, stroke = 12, color = 'var(--primary)', track = '#eceef5', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / (max || 1)))
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="label">{children}</div>
    </div>
  )
}

export function Sheet({ open, onClose, title, subtitle, children }) {
  if (!open) return null
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog">
        <div className="grabber" />
        {title && <h3>{title}</h3>}
        {subtitle && <p className="small muted mb16">{subtitle}</p>}
        {children}
      </div>
    </>
  )
}

export function Empty({ emoji = '📭', title, text, action }) {
  return (
    <div className="empty">
      <div className="em">{emoji}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="mt16">{action}</div>}
    </div>
  )
}

export function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className="toast" key={toast.key}>
      {toast.kind === 'info' ? <Info size={18} color="#9db4ff" /> : <CheckCircle2 size={18} color="#4ade80" />}
      {toast.msg}
    </div>
  )
}

export function Confetti({ count = 40 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.6,
        color: ['#5B3DF5', '#FFB020', '#12B76A', '#FF6B9A', '#2E90FA'][i % 5],
        rot: Math.random() * 360,
      })),
    [count],
  )
  return (
    <div className="confetti">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: p.left + '%',
            background: p.color,
            animationDelay: p.delay + 's',
            animationDuration: p.dur + 's',
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}

const STATUS = {
  berjalan: { label: 'Dikerjakan', cls: 'info' },
  ditinjau: { label: 'Menunggu Tinjauan', cls: 'warning' },
  revisi: { label: 'Perlu Revisi', cls: 'danger' },
  selesai: { label: 'Selesai', cls: 'success' },
  aktif: { label: 'Aktif', cls: 'success' },
  draf: { label: 'Draf', cls: 'neutral' },
}
export function StatusBadge({ status, label }) {
  const s = STATUS[status] || { label: status, cls: 'neutral' }
  return <span className={`badge ${s.cls}`}>{label || s.label}</span>
}

/** Atur warna status bar pada bingkai ponsel desktop */
export function useStatusBar(bg, ink) {
  useEffect(() => {
    const el = document.querySelector('.phone')
    if (!el) return
    el.style.setProperty('--sb-bg', bg || 'var(--bg)')
    el.style.setProperty('--sb-ink', ink || 'var(--ink)')
    return () => {
      el.style.removeProperty('--sb-bg')
      el.style.removeProperty('--sb-ink')
    }
  }, [bg, ink])
}
