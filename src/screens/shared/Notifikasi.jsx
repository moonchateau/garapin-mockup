import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckCheck, ClipboardCheck, RotateCcw, Star, UserPlus, Wallet } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { waktuLalu } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Empty, TopBar } from '../../components/ui'

const ICONS = {
  quest: [Briefcase, 'var(--primary)', 'var(--primary-50)'],
  review: [ClipboardCheck, 'var(--warning)', 'var(--warning-50)'],
  money: [Wallet, 'var(--success)', 'var(--success-50)'],
  star: [Star, '#a96800', 'var(--accent-50)'],
  user: [UserPlus, 'var(--info)', 'var(--info-50)'],
  revisi: [RotateCcw, 'var(--danger)', 'var(--danger-50)'],
}

export default function Notifikasi({ role }) {
  const nav = useNavigate()
  const { state, dispatch } = useStore()
  const list = state.notifs.filter((n) => n.role === role).sort((a, b) => new Date(b.date) - new Date(a.date))
  const unread = list.filter((n) => !n.read).length

  return (
    <Screen className="pb-nav">
      <TopBar
        title="Notifikasi"
        variant="surface"
        right={
          unread > 0 && (
            <button className="btn sm btn-soft" onClick={() => dispatch({ type: 'READ_NOTIFS', role })}>
              <CheckCheck size={15} /> Tandai dibaca
            </button>
          )
        }
      />
      {list.length === 0 ? (
        <Empty emoji="🔔" title="Belum ada notifikasi" text="Kabar terbaru tentang quest-mu akan muncul di sini." />
      ) : (
        list.map((n) => {
          const [Icon, c, bg] = ICONS[n.icon] || ICONS.quest
          return (
            <button
              key={n.id}
              className={`notif-item ${n.read ? '' : 'unread'}`}
              onClick={() => {
                dispatch({ type: 'READ_NOTIF', id: n.id })
                if (n.link) nav(n.link)
              }}
            >
              <span className="list-ic" style={{ background: bg, color: c }}>
                <Icon size={19} />
              </span>
              <span className="grow">
                <span className="row between gap6">
                  <span className="bold small">{n.title}</span>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--primary)', flexShrink: 0 }} />}
                </span>
                <span className="xs ink2 clamp2" style={{ marginTop: 3, lineHeight: 1.45 }}>
                  {n.body}
                </span>
                <span className="xs muted" style={{ display: 'block', marginTop: 4 }}>
                  {waktuLalu(n.date)}
                </span>
              </span>
            </button>
          )
        })
      )}
    </Screen>
  )
}
