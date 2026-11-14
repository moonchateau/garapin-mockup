import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, CreditCard, HelpCircle, LogOut, MapPin, Pencil, RefreshCw, Repeat, Shield, Star, Target, Zap } from 'lucide-react'
import { BRANDS, ME_WORKER, WORKERS } from '../../data/mock'
import { useStore, useWorkerFinance } from '../../store/AppStore'
import { rupiahSingkat, tanggal } from '../../utils/format'
import { Avatar, ProgressBar, Stars } from '../../components/ui'

export function useMyReviews() {
  const { state } = useStore()
  return state.participations
    .filter((p) => p.workerId === ME_WORKER && p.review)
    .map((p) => {
      const q = state.quests.find((x) => x.id === p.questId)
      return { ...p.review, id: p.id, quest: q, brand: BRANDS[q.brandId] }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function ReviewCard({ r }) {
  return (
    <div className="card">
      <div className="row">
        <Avatar name={r.brand.name} color={r.brand.color} size={36} square />
        <div className="grow">
          <div className="bold small">{r.brand.name}</div>
          <div className="xs muted ellipsis">{r.quest.title}</div>
        </div>
        <Stars value={r.rating} size={13} />
      </div>
      <p className="small ink2 mt12" style={{ lineHeight: 1.55 }}>
        "{r.comment || 'Kerja bagus!'}"
      </p>
      <div className="xs muted mt8">{tanggal(r.date)}</div>
    </div>
  )
}

export function MenuItem({ icon: Icon, label, sub, onClick, color = 'var(--ink-2)', bg = '#f0f1f6', danger }) {
  return (
    <button className="list-item" onClick={onClick}>
      <span className="list-ic" style={{ background: danger ? 'var(--danger-50)' : bg, color: danger ? 'var(--danger)' : color }}>
        <Icon size={18} />
      </span>
      <span className="grow">
        <span className={`bold small ${danger ? 'text-danger' : ''}`} style={{ display: 'block' }}>
          {label}
        </span>
        {sub && <span className="xs muted">{sub}</span>}
      </span>
      {!danger && <ChevronRight size={18} color="var(--muted)" />}
    </button>
  )
}

export default function Profil() {
  const nav = useNavigate()
  const { state, dispatch, showToast } = useStore()
  const fin = useWorkerFinance()
  const me = WORKERS[ME_WORKER]
  const reviews = useMyReviews()
  const done = state.participations.filter((p) => p.workerId === ME_WORKER && p.status === 'selesai').length
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : me.rating
  const soon = () => showToast('Fitur ini segera hadir', 'info')

  return (
    <div className="pb-nav">
      <div style={{ background: 'linear-gradient(160deg,#7a5cff,#5b3df5 60%,#3b1fd1)', padding: '18px 16px 70px', color: '#fff', position: 'relative' }}>
        <div className="row between">
          <h1 className="h2">Profil</h1>
          <button className="icon-btn" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }} onClick={soon} aria-label="Edit profil">
            <Pencil size={18} />
          </button>
        </div>
      </div>
      <div className="pad" style={{ marginTop: -56 }}>
        <div className="card center" style={{ boxShadow: 'var(--shadow)' }}>
          <div style={{ marginTop: -50, display: 'inline-block', borderRadius: '50%', border: '4px solid #fff' }}>
            <Avatar name={me.name} color={me.color} size={80} />
          </div>
          <h2 className="h2 mt8">{me.name}</h2>
          <div className="small muted bold row mt4" style={{ justifyContent: 'center', gap: 4 }}>
            <MapPin size={13} /> {me.city}
          </div>
          <div className="row mt12" style={{ justifyContent: 'center', gap: 6 }}>
            <span className="badge accent">
              <Zap size={12} fill="currentColor" /> Level {me.level} · Pemburu Quest
            </span>
            <span className="badge success">
              <Shield size={12} /> Terverifikasi
            </span>
          </div>
          <div className="mt16" style={{ textAlign: 'left' }}>
            <div className="row between xs bold mb8" style={{ marginBottom: 6 }}>
              <span className="muted">
                {me.xp}/{me.xpNext} XP
              </span>
              <span className="text-primary">Level {me.level + 1}</span>
            </div>
            <ProgressBar value={me.xp} max={me.xpNext} />
          </div>
          <div className="divider" />
          <div className="row" style={{ justifyContent: 'space-around' }}>
            <div>
              <div className="h2">{done}</div>
              <div className="xs muted bold">Quest selesai</div>
            </div>
            <div>
              <div className="h2 row gap4" style={{ justifyContent: 'center' }}>
                <Star size={17} fill="var(--accent)" color="var(--accent)" />
                {avg.toFixed(1)}
              </div>
              <div className="xs muted bold">{reviews.length} ulasan</div>
            </div>
            <div>
              <div className="h2">{rupiahSingkat(fin.totalIn)}</div>
              <div className="xs muted bold">Pendapatan</div>
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Tentang Saya</h2>
        </div>
        <p className="small ink2" style={{ lineHeight: 1.6 }}>
          {me.bio}
        </p>
        <div className="row wrap mt12" style={{ gap: 6 }}>
          {me.skills.map((s) => (
            <span key={s} className="badge primary" style={{ height: 30, padding: '0 12px', borderRadius: 10 }}>
              {s}
            </span>
          ))}
        </div>

        <div className="section-head">
          <h2>Ulasan Terbaru</h2>
          <button className="link" onClick={() => nav('/p/ulasan')}>
            Lihat semua
          </button>
        </div>
        <div className="stack">
          {reviews.slice(0, 2).map((r) => (
            <ReviewCard key={r.id} r={r} />
          ))}
        </div>

        <div className="section-head">
          <h2>Pengaturan</h2>
        </div>
        <div className="menu-group">
          <MenuItem icon={Target} label="Target Keuangan" sub={state.target?.name || 'Belum diatur'} bg="var(--accent-50)" color="#a96800" onClick={() => nav('/p/target')} />
          <MenuItem icon={CreditCard} label="Rekening & E-wallet" sub="BCA, GoPay, DANA" onClick={soon} />
          <MenuItem icon={Bell} label="Notifikasi" onClick={() => nav('/p/notifikasi')} />
          <MenuItem icon={HelpCircle} label="Pusat Bantuan" onClick={soon} />
        </div>

        <div className="section-head">
          <h2>Mode Demo</h2>
        </div>
        <div className="menu-group">
          <MenuItem
            icon={Repeat}
            label="Ganti ke Mode Brand"
            sub="Lihat aplikasi dari sisi brand"
            bg="var(--primary-50)"
            color="var(--primary)"
            onClick={() => {
              dispatch({ type: 'SWITCH_ROLE', role: 'brand' })
              nav('/b/beranda')
            }}
          />
          <MenuItem
            icon={RefreshCw}
            label="Reset Data Demo"
            sub="Kembalikan semua data ke awal"
            onClick={() => {
              dispatch({ type: 'RESET' })
              showToast('Data demo sudah direset')
            }}
          />
          <MenuItem
            icon={LogOut}
            label="Keluar"
            danger
            onClick={() => {
              dispatch({ type: 'LOGOUT' })
              nav('/peran', { replace: true })
            }}
          />
        </div>
        <p className="xs muted center mt20">Garapin v0.1 · Mockup</p>
      </div>
    </div>
  )
}
