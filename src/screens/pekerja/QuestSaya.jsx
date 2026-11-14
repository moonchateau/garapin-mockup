import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Clock } from 'lucide-react'
import { BRANDS, ME_WORKER } from '../../data/mock'
import { useStore } from '../../store/AppStore'
import { labelSisaHari, rupiah, tanggalPendek, waktuLalu } from '../../utils/format'
import { QuestCover } from '../../components/QuestCard'
import { Empty, ProgressBar, Stars, StatusBadge } from '../../components/ui'

const TABS = [
  { id: 'aktif', label: 'Berjalan', match: ['berjalan', 'revisi'] },
  { id: 'tinjau', label: 'Ditinjau', match: ['ditinjau'] },
  { id: 'selesai', label: 'Selesai', match: ['selesai'] },
]

export default function QuestSaya() {
  const nav = useNavigate()
  const { state } = useStore()
  const [tab, setTab] = useState('aktif')
  const mine = state.participations.filter((p) => p.workerId === ME_WORKER)
  const current = TABS.find((t) => t.id === tab)
  const list = mine
    .filter((p) => current.match.includes(p.status))
    .sort((a, b) => new Date(b.paidAt || b.submittedAt || b.takenAt) - new Date(a.paidAt || a.submittedAt || a.takenAt))

  return (
    <div className="pad pb-nav">
      <div style={{ padding: '14px 0 14px' }}>
        <h1 className="h1">Quest Saya</h1>
        <p className="small muted mt4">Pantau semua quest yang sedang dan sudah kamu kerjakan</p>
      </div>
      <div className="tabs mb16">
        {TABS.map((t) => {
          const c = mine.filter((p) => t.match.includes(p.status)).length
          return (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label} {c > 0 && <span className="count">{c}</span>}
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <Empty
          emoji={tab === 'aktif' ? '🧭' : tab === 'tinjau' ? '⏳' : '🏆'}
          title={tab === 'aktif' ? 'Belum ada quest berjalan' : tab === 'tinjau' ? 'Tidak ada yang sedang ditinjau' : 'Belum ada quest selesai'}
          text={tab === 'aktif' ? 'Yuk cari quest yang seru dan mulai hasilkan uang!' : 'Hasil kerja yang kamu kirim akan muncul di sini.'}
          action={
            tab === 'aktif' && (
              <button className="btn btn-primary" onClick={() => nav('/p/jelajah')}>
                Jelajah Quest
              </button>
            )
          }
        />
      ) : (
        <div className="stack">
          {list.map((p) => {
            const q = state.quests.find((x) => x.id === p.questId)
            const done = p.progress.filter(Boolean).length
            return (
              <button key={p.id} className="card tap" onClick={() => nav(`/p/kerja/${p.id}`)}>
                <div className="row top">
                  <QuestCover quest={q} size={46} />
                  <div className="grow">
                    <div className="row between gap6">
                      <span className="xs muted bold ellipsis">{BRANDS[q.brandId].name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="bold clamp2 mt4" style={{ fontSize: 14.5, lineHeight: 1.35 }}>
                      {q.title}
                    </div>
                  </div>
                </div>

                {p.status === 'selesai' ? (
                  <div className="row between mt12" style={{ background: 'var(--success-50)', borderRadius: 12, padding: '10px 12px' }}>
                    <div>
                      <div className="xs bold" style={{ color: '#0b7a47' }}>
                        Dibayar {tanggalPendek(p.paidAt)}
                      </div>
                      <div className="bold text-success">+{rupiah(q.budget)}</div>
                    </div>
                    {p.review && <Stars value={p.review.rating} size={15} />}
                  </div>
                ) : p.status === 'ditinjau' ? (
                  <div className="row between mt12 xs bold">
                    <span className="muted">Dikirim {waktuLalu(p.submittedAt)}</span>
                    <span className="text-primary">{rupiah(q.budget)}</span>
                  </div>
                ) : (
                  <>
                    {p.status === 'revisi' && (
                      <div className="banner warning mt12" style={{ padding: '8px 12px' }}>
                        ⚠️ <span className="clamp2">{p.revisionNote}</span>
                      </div>
                    )}
                    <div className="row mt12" style={{ gap: 10 }}>
                      <div className="grow">
                        <ProgressBar value={done} max={p.progress.length} variant="success" thin />
                      </div>
                      <span className="xs bold">
                        {done}/{p.progress.length} tugas
                      </span>
                    </div>
                    <div className="row between mt8 xs bold">
                      <span className="muted row gap4">
                        <Clock size={12} /> {labelSisaHari(q.endDate)}
                      </span>
                      <span className="text-primary row gap4">
                        Lanjutkan <ChevronRight size={14} />
                      </span>
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
