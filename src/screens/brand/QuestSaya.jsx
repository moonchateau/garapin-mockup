import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ME_BRAND, WORKERS } from '../../data/mock'
import { useStore } from '../../store/AppStore'
import { rupiah, tanggalPendek, waktuLalu } from '../../utils/format'
import QuestCard from '../../components/QuestCard'
import { Avatar, Empty } from '../../components/ui'

const TABS = [
  { id: 'aktif', label: 'Aktif' },
  { id: 'tinjau', label: 'Tinjau' },
  { id: 'draf', label: 'Draf' },
  { id: 'selesai', label: 'Selesai' },
]

export default function BrandQuestSaya() {
  const nav = useNavigate()
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'aktif'
  const mine = state.quests.filter((q) => q.brandId === ME_BRAND)
  const pending = state.participations
    .filter((p) => p.status === 'ditinjau' && mine.some((q) => q.id === p.questId))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  const counts = {
    aktif: mine.filter((q) => q.status === 'aktif').length,
    tinjau: pending.length,
    draf: mine.filter((q) => q.status === 'draf').length,
    selesai: mine.filter((q) => q.status === 'selesai').length,
  }
  const list = mine.filter((q) => q.status === tab)

  return (
    <div className="pad pb-nav">
      <div className="row between" style={{ padding: '14px 0 14px' }}>
        <div>
          <h1 className="h1">Quest Saya</h1>
          <p className="small muted mt4">Kelola quest dan tinjau hasil kerja</p>
        </div>
        <button className="btn sm btn-primary" onClick={() => nav('/b/buat')}>
          <Plus size={16} /> Buat
        </button>
      </div>
      <div className="tabs mb16">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setParams(t.id === 'aktif' ? {} : { tab: t.id }, { replace: true })}>
            {t.label} {counts[t.id] > 0 && <span className="count">{counts[t.id]}</span>}
          </button>
        ))}
      </div>

      {tab === 'tinjau' ? (
        pending.length === 0 ? (
          <Empty emoji="✅" title="Semua sudah ditinjau" text="Hasil kerja baru dari pekerja akan muncul di sini." />
        ) : (
          <div className="stack">
            {pending.map((p) => {
              const w = WORKERS[p.workerId]
              const q = state.quests.find((x) => x.id === p.questId)
              return (
                <button key={p.id} className="card tap" onClick={() => nav(`/b/tinjau/${p.id}`)}>
                  <div className="row">
                    <Avatar name={w.name} color={w.color} size={42} />
                    <div className="grow">
                      <div className="bold small">{w.name}</div>
                      <div className="xs muted ellipsis">{q.title}</div>
                    </div>
                    <span className="badge warning">Tinjau</span>
                  </div>
                  {p.note && (
                    <p className="small ink2 mt12 clamp2" style={{ background: 'var(--bg)', borderRadius: 12, padding: '8px 12px' }}>
                      "{p.note}"
                    </p>
                  )}
                  <div className="row between mt12 xs bold">
                    <span className="muted">Dikirim {waktuLalu(p.submittedAt)}</span>
                    <span className="text-primary">{rupiah(q.budget)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )
      ) : list.length === 0 ? (
        <Empty
          emoji={tab === 'draf' ? '📝' : tab === 'selesai' ? '🏁' : '📢'}
          title={tab === 'draf' ? 'Tidak ada draf' : tab === 'selesai' ? 'Belum ada quest selesai' : 'Belum ada quest aktif'}
          text="Buat quest baru untuk mulai merekrut pekerja."
          action={
            <button className="btn btn-primary" onClick={() => nav('/b/buat')}>
              <Plus size={17} /> Buat Quest
            </button>
          }
        />
      ) : (
        <div className="stack">
          {list.map((q) => {
            const pc = state.participations.filter((p) => p.questId === q.id && p.status === 'ditinjau').length
            return (
              <QuestCard
                key={q.id}
                quest={q}
                to={q.status === 'draf' ? `/b/buat/${q.id}` : `/b/quest/${q.id}`}
                showSlots={q.status !== 'draf'}
                right={
                  q.status === 'draf' ? (
                    <span className="badge neutral">Draf · {tanggalPendek(q.createdAt)}</span>
                  ) : pc > 0 ? (
                    <span className="badge warning">{pc} perlu ditinjau</span>
                  ) : (
                    <span className={`badge ${q.status === 'aktif' ? 'success' : 'neutral'}`}>{q.status === 'aktif' ? 'Aktif' : 'Selesai'}</span>
                  )
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
