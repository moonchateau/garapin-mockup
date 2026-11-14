import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Confetti } from '../../components/ui'

export default function Sukses() {
  const { state: s } = useLocation()
  const nav = useNavigate()
  if (!s) return <Navigate to="/" replace />

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {s.confetti && <Confetti />}
      <div className="success-screen">
        <div className="success-ic anim-pop">{s.emoji || '✅'}</div>
        <h1 className="h1 anim-rise" style={{ animationDelay: '.1s' }}>
          {s.title}
        </h1>
        <p className="ink2 mt12 anim-rise" style={{ lineHeight: 1.6, animationDelay: '.2s', maxWidth: 320 }}>
          {s.text}
        </p>
      </div>
      <div className="pad stack" style={{ paddingBottom: 28 }}>
        {s.primary && (
          <button className="btn btn-primary block" onClick={() => nav(s.primary.to, { replace: true })}>
            {s.primary.label}
          </button>
        )}
        {s.secondary && (
          <button className="btn btn-ghost block" onClick={() => nav(s.secondary.to, { replace: true })}>
            {s.secondary.label}
          </button>
        )}
      </div>
    </div>
  )
}
