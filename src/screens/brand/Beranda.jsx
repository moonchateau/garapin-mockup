import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Bell, ChevronRight, ClipboardCheck, Plus, Sparkles, Users, Wallet, Zap } from 'lucide-react'
import { BRANDS, ME_BRAND, WORKERS } from '../../data/mock'
import { useBrandFinance, useStore } from '../../store/AppStore'
import { rupiah, rupiahSingkat, sapaan, waktuLalu } from '../../utils/format'
import { Avatar } from '../../components/ui'
import QuestCard from '../../components/QuestCard'

export default function BrandBeranda() {
  const nav = useNavigate()
  const { state } = useStore()
  const fin = useBrandFinance()
  const brand = BRANDS[ME_BRAND]
  const unread = state.notifs.filter((n) => n.role === 'brand' && !n.read).length

  const myQuests = state.quests.filter((q) => q.brandId === ME_BRAND)
  const active = myQuests.filter((q) => q.status === 'aktif')
  const myParts = state.participations.filter((p) => myQuests.some((q) => q.id === p.questId))
  const pending = myParts.filter((p) => p.status === 'ditinjau')
  const working = myParts.filter((p) => ['berjalan', 'revisi', 'ditinjau'].includes(p.status))
  const doneCount = myParts.filter((p) => p.status === 'selesai').length
  const activity = state.notifs.filter((n) => n.role === 'brand').slice(0, 4)

  return (
    <div className="pad pb-nav">
      <div className="row" style={{ padding: '12px 0 16px' }}>
        <Avatar name={brand.name} color={brand.color} size={44} square />
        <div className="grow">
          <div className="small muted bold">{sapaan()},</div>
          <div className="h3 row gap4">
            {brand.name} <BadgeCheck size={16} color="var(--info)" />
          </div>
        </div>
        <button className="icon-btn solid" onClick={() => nav('/b/notifikasi')} aria-label="Notifikasi">
          <Bell size={20} />
          {unread > 0 && <span className="dot" />}
        </button>
      </div>

      <div className="hero">
        <div className="small muted-w bold">Saldo brand</div>
        <div className="row between mt4">
          <div className="xbold" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
            {rupiah(fin.balance)}
          </div>
          <button className="btn sm btn-white" onClick={() => nav('/b/topup')}>
            <Plus size={15} /> Top Up
          </button>
        </div>
        <div className="row mt16" style={{ gap: 8 }}>
          <div className="glass grow">
            <div className="xs muted-w">Dana ditahan</div>
            <div className="bold">{rupiahSingkat(fin.held)}</div>
          </div>
          <div className="glass grow">
            <div className="xs muted-w">Sudah dibayarkan</div>
            <div className="bold">{rupiahSingkat(fin.paidOut)}</div>
          </div>
        </div>
      </div>

      {pending.length > 0 && (
        <button
          className="card tap mt16 row"
          style={{ background: 'var(--warning-50)', borderColor: '#fde3bd' }}
          onClick={() => (pending.length === 1 ? nav(`/b/tinjau/${pending[0].id}`) : nav('/b/quest?tab=tinjau'))}
        >
          <span className="list-ic" style={{ background: '#fff', color: 'var(--warning)' }}>
            <ClipboardCheck size={20} />
          </span>
          <span className="grow">
            <b className="small" style={{ display: 'block' }}>
              {pending.length} hasil kerja menunggu tinjauan
            </b>
            <span className="xs" style={{ color: '#93530a' }}>
              Tinjau & bayar agar pekerja tetap semangat
            </span>
          </span>
          <ChevronRight size={18} color="#93530a" />
        </button>
      )}

      <div className="stat-grid mt16">
        <div className="stat">
          <div className="ic" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
            <Zap size={16} />
          </div>
          <div className="v">{active.length}</div>
          <div className="k">Quest aktif</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: 'var(--info-50)', color: 'var(--info)' }}>
            <Users size={16} />
          </div>
          <div className="v">{working.length}</div>
          <div className="k">Pekerja aktif</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: 'var(--success-50)', color: 'var(--success)' }}>
            <Wallet size={16} />
          </div>
          <div className="v">{doneCount}</div>
          <div className="k">Tugas selesai</div>
        </div>
      </div>

      <button
        className="card tap mt16 row"
        style={{ background: 'linear-gradient(135deg,#fff6e0,#ffe7b8)', borderColor: '#ffe2a8' }}
        onClick={() => nav('/b/buat')}
      >
        <span style={{ fontSize: 34 }}>🚀</span>
        <span className="grow">
          <b style={{ display: 'block' }}>Butuh bantuan pekerja?</b>
          <span className="xs" style={{ color: '#7a5200' }}>
            Buat quest baru dalam 2 menit
          </span>
        </span>
        <span className="btn sm btn-primary">
          <Sparkles size={14} /> Buat
        </span>
      </button>

      <div className="section-head">
        <h2>Quest Aktif</h2>
        <button className="link" onClick={() => nav('/b/quest')}>
          Lihat semua
        </button>
      </div>
      <div className="stack">
        {active.slice(0, 3).map((q) => {
          const pc = myParts.filter((p) => p.questId === q.id && p.status === 'ditinjau').length
          return (
            <QuestCard
              key={q.id}
              quest={q}
              to={`/b/quest/${q.id}`}
              right={pc > 0 ? <span className="badge warning">{pc} perlu ditinjau</span> : <span className="badge success">Aktif</span>}
            />
          )
        })}
      </div>

      <div className="section-head">
        <h2>Aktivitas Terbaru</h2>
        <button className="link" onClick={() => nav('/b/notifikasi')}>
          Semua
        </button>
      </div>
      <div className="menu-group">
        {activity.map((n) => {
          const w = Object.values(WORKERS).find((x) => n.title.startsWith(x.name))
          return (
            <button key={n.id} className="list-item" onClick={() => n.link && nav(n.link)}>
              {w ? <Avatar name={w.name} color={w.color} size={38} /> : <span className="list-ic" style={{ background: 'var(--primary-50)' }}>🔔</span>}
              <span className="grow">
                <span className="small bold clamp2">{n.title}</span>
                <span className="xs muted ellipsis" style={{ display: 'block' }}>
                  {n.body}
                </span>
              </span>
              <span className="xs muted" style={{ whiteSpace: 'nowrap' }}>
                {waktuLalu(n.date)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
