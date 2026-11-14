import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Bell, ChevronRight, Clock, Flame, Target, Zap } from 'lucide-react'
import { BRANDS, KATEGORI, ME_WORKER, WORKERS, kategoriById } from '../../data/mock'
import { useQuestHelpers, useStore, useWorkerFinance } from '../../store/AppStore'
import { labelSisaHari, rupiah, rupiahSingkat, sapaan } from '../../utils/format'
import { Avatar, ProgressBar } from '../../components/ui'
import QuestCard from '../../components/QuestCard'

export default function Beranda() {
  const nav = useNavigate()
  const { state } = useStore()
  const fin = useWorkerFinance()
  const { filled, myParticipation } = useQuestHelpers()
  const me = WORKERS[ME_WORKER]
  const unread = state.notifs.filter((n) => n.role === 'pekerja' && !n.read).length

  const open = state.quests.filter((q) => q.status === 'aktif' && !myParticipation(q.id) && filled(q) < q.slots)
  const featured = [...open].sort((a, b) => b.budget - a.budget).slice(0, 5)
  const ending = [...open].sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 3)

  const ongoing = state.participations.filter((p) => p.workerId === ME_WORKER && ['berjalan', 'revisi'].includes(p.status))

  const t = state.target
  const pct = t ? Math.min(100, Math.round((fin.targetSaved / t.amount) * 100)) : 0
  const questsLeft = t ? Math.max(0, Math.ceil((t.amount - fin.targetSaved) / fin.avgPay)) : 0

  return (
    <div className="pad pb-nav">
      {/* Header */}
      <div className="row" style={{ padding: '12px 0 16px' }}>
        <button onClick={() => nav('/p/profil')}>
          <Avatar name={me.name} color={me.color} size={44} />
        </button>
        <div className="grow">
          <div className="small muted bold">{sapaan()},</div>
          <div className="h3">{me.name.split(' ')[0]} 👋</div>
        </div>
        <span className="badge accent">
          <Zap size={12} fill="currentColor" /> Lv. {me.level}
        </span>
        <button className="icon-btn solid" onClick={() => nav('/p/notifikasi')} aria-label="Notifikasi">
          <Bell size={20} />
          {unread > 0 && <span className="dot" />}
        </button>
      </div>

      {/* Saldo */}
      <div className="hero">
        <div className="small muted-w bold">Saldo kamu</div>
        <div className="row between mt4">
          <div className="xbold" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
            {rupiah(fin.balance)}
          </div>
          <button className="btn sm btn-white" onClick={() => nav('/p/tarik')}>
            Tarik <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="row mt16" style={{ gap: 8 }}>
          <div className="glass grow">
            <div className="xs muted-w">Bulan ini</div>
            <div className="bold">{rupiahSingkat(fin.thisMonth)}</div>
          </div>
          <div className="glass grow">
            <div className="xs muted-w">Menunggu cair</div>
            <div className="bold">{rupiahSingkat(fin.pending)}</div>
          </div>
        </div>
      </div>

      {/* Target */}
      {t ? (
        <button className="card tap mt16" onClick={() => nav('/p/target')}>
          <div className="row">
            <div className="qcover" style={{ background: 'var(--accent-50)', width: 44, height: 44, fontSize: 22 }}>
              {t.emoji}
            </div>
            <div className="grow">
              <div className="xs muted bold row gap4">
                <Target size={12} /> Target keuangan
              </div>
              <div className="bold ellipsis">{t.name}</div>
            </div>
            <div className="h2 text-primary">{pct}%</div>
          </div>
          <div className="mt12">
            <ProgressBar value={fin.targetSaved} max={t.amount} variant="accent" />
          </div>
          <div className="row between mt8 xs">
            <span className="muted bold">
              {rupiahSingkat(fin.targetSaved)} dari {rupiahSingkat(t.amount)}
            </span>
            <span className="bold text-primary">{questsLeft > 0 ? `≈ ${questsLeft} quest lagi` : 'Tercapai! 🎉'}</span>
          </div>
        </button>
      ) : (
        <button className="card tap mt16 row" onClick={() => nav('/p/target')}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <span className="grow">
            <b>Pasang target keuangan</b>
            <div className="xs muted">Biar makin semangat ambil quest!</div>
          </span>
          <ChevronRight size={18} className="muted" />
        </button>
      )}

      {/* Quest berjalan */}
      {ongoing.length > 0 && (
        <>
          <div className="section-head">
            <h2>Lanjutkan Quest</h2>
            <button className="link" onClick={() => nav('/p/quest')}>
              Lihat semua
            </button>
          </div>
          <div className="stack">
            {ongoing.slice(0, 2).map((p) => {
              const q = state.quests.find((x) => x.id === p.questId)
              const done = p.progress.filter(Boolean).length
              return (
                <button key={p.id} className="card tap" onClick={() => nav(`/p/kerja/${p.id}`)}>
                  <div className="row">
                    <div className="qcover" style={{ background: kategoriById(q.category).color + '1f', width: 42, height: 42, fontSize: 20 }}>
                      {kategoriById(q.category).emoji}
                    </div>
                    <div className="grow">
                      <div className="bold ellipsis" style={{ fontSize: 14 }}>
                        {q.title}
                      </div>
                      <div className="xs muted bold row gap4 mt4">
                        {p.status === 'revisi' ? (
                          <span className="text-danger">⚠️ Perlu revisi</span>
                        ) : (
                          <>
                            <Clock size={12} /> {labelSisaHari(q.endDate)}
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--muted)" />
                  </div>
                  <div className="row mt12" style={{ gap: 10 }}>
                    <div className="grow">
                      <ProgressBar value={done} max={p.progress.length} variant="success" thin />
                    </div>
                    <span className="xs bold">
                      {done}/{p.progress.length} tugas
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Kategori */}
      <div className="section-head">
        <h2>Kategori</h2>
      </div>
      <div className="cat-grid">
        {KATEGORI.map((k) => (
          <button key={k.id} className="cat" onClick={() => nav(`/p/jelajah?kat=${k.id}`)}>
            <span className="ic" style={{ background: k.color + '1f' }}>
              {k.emoji}
            </span>
            {k.label}
          </button>
        ))}
        <button className="cat" onClick={() => nav('/p/jelajah')}>
          <span className="ic" style={{ background: '#eceef5', fontSize: 20 }}>
            •••
          </span>
          Semua
        </button>
      </div>

      {/* Pilihan */}
      <div className="section-head">
        <h2>🔥 Bayaran Tertinggi</h2>
        <button className="link" onClick={() => nav('/p/jelajah?urut=bayaran')}>
          Lihat semua
        </button>
      </div>
      <div className="hscroll">
        {featured.map((q) => {
          const k = kategoriById(q.category)
          const left = q.slots - filled(q)
          return (
            <button key={q.id} className="card tap feature-card" onClick={() => nav(`/p/quest/${q.id}`)}>
              <div className="band" style={{ background: `linear-gradient(135deg, ${k.color}33, ${k.color}14)` }}>
                {k.emoji}
                <span className={`badge ${left <= 2 ? 'danger' : 'neutral'}`}>
                  {left <= 2 ? <Flame size={12} /> : null} Sisa {left} slot
                </span>
              </div>
              <div className="body">
                <div className="xs muted bold">{BRANDS[q.brandId].name}</div>
                <div className="bold clamp2 mt4" style={{ fontSize: 14, minHeight: 38 }}>
                  {q.title}
                </div>
                <div className="row between mt8">
                  <span className="price">{rupiah(q.budget)}</span>
                  <span className="xs muted bold">{labelSisaHari(q.endDate)}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Segera berakhir */}
      <div className="section-head">
        <h2>⏳ Segera Berakhir</h2>
        <button className="link" onClick={() => nav('/p/jelajah?urut=tenggat')}>
          Lihat semua
        </button>
      </div>
      <div className="stack">
        {ending.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  )
}
