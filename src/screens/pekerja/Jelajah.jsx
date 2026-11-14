import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { BRANDS, KATEGORI } from '../../data/mock'
import { useQuestHelpers, useStore } from '../../store/AppStore'
import QuestCard from '../../components/QuestCard'
import { Empty, Sheet } from '../../components/ui'

const URUTAN = [
  { id: 'terbaru', label: 'Terbaru' },
  { id: 'bayaran', label: 'Bayaran tertinggi' },
  { id: 'tenggat', label: 'Segera berakhir' },
  { id: 'slot', label: 'Slot terbanyak' },
]

export default function Jelajah() {
  const { state } = useStore()
  const { filled, myParticipation } = useQuestHelpers()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [sheet, setSheet] = useState(false)
  const [remoteOnly, setRemoteOnly] = useState(false)
  const kat = params.get('kat') || 'semua'
  const urut = params.get('urut') || 'terbaru'

  const set = (k, v) => {
    const next = new URLSearchParams(params)
    if (!v || v === 'semua' || (k === 'urut' && v === 'terbaru')) next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    let r = state.quests.filter((x) => x.status === 'aktif')
    if (kat !== 'semua') r = r.filter((x) => x.category === kat)
    if (remoteOnly) r = r.filter((x) => x.location === 'Remote')
    if (q.trim()) {
      const s = q.toLowerCase()
      r = r.filter((x) => x.title.toLowerCase().includes(s) || BRANDS[x.brandId].name.toLowerCase().includes(s))
    }
    const sorters = {
      terbaru: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      bayaran: (a, b) => b.budget - a.budget,
      tenggat: (a, b) => new Date(a.endDate) - new Date(b.endDate),
      slot: (a, b) => b.slots - filled(b) - (a.slots - filled(a)),
    }
    return [...r].sort(sorters[urut])
  }, [state.quests, kat, q, urut, remoteOnly, filled])

  return (
    <div className="pad pb-nav">
      <div style={{ padding: '14px 0 12px' }}>
        <h1 className="h1">Jelajah Quest</h1>
        <p className="small muted mt4">Temukan quest yang cocok dengan keahlianmu</p>
      </div>

      <div className="row" style={{ gap: 8 }}>
        <label className="search grow">
          <Search size={18} />
          <input placeholder="Cari quest atau brand…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <button onClick={() => setQ('')} aria-label="Hapus">
              <X size={16} />
            </button>
          )}
        </label>
        <button className="icon-btn solid" style={{ width: 48, height: 48, borderRadius: 14 }} onClick={() => setSheet(true)} aria-label="Filter">
          <SlidersHorizontal size={19} />
        </button>
      </div>

      <div className="chips mt12">
        <button className={`chip ${kat === 'semua' ? 'active' : ''}`} onClick={() => set('kat', 'semua')}>
          Semua
        </button>
        {KATEGORI.map((k) => (
          <button key={k.id} className={`chip ${kat === k.id ? 'active' : ''}`} onClick={() => set('kat', k.id)}>
            {k.emoji} {k.label}
          </button>
        ))}
      </div>

      <div className="row between mt16 mb12">
        <span className="small muted bold">{list.length} quest ditemukan</span>
        <button className="small bold text-primary" onClick={() => setSheet(true)}>
          {URUTAN.find((u) => u.id === urut).label} ▾
        </button>
      </div>

      {list.length === 0 ? (
        <Empty emoji="🔍" title="Quest tidak ditemukan" text="Coba ubah kata kunci atau filter kategori." />
      ) : (
        <div className="stack">
          {list.map((x) => {
            const mine = myParticipation(x.id)
            const full = filled(x) >= x.slots
            return (
              <QuestCard
                key={x.id}
                quest={x}
                right={mine ? <span className="badge primary">Sudah diambil</span> : full ? <span className="badge neutral">Penuh</span> : null}
              />
            )
          })}
        </div>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Urutkan & Filter">
        <div className="small bold mt12 mb8">Urutkan berdasarkan</div>
        <div className="select-grid">
          {URUTAN.map((u) => (
            <button key={u.id} className={`select-tile ${urut === u.id ? 'active' : ''}`} onClick={() => set('urut', u.id)}>
              {u.label}
            </button>
          ))}
        </div>
        <div className="small bold mt16 mb8">Lokasi</div>
        <div className="select-grid">
          <button className={`select-tile ${!remoteOnly ? 'active' : ''}`} onClick={() => setRemoteOnly(false)}>
            📍 Semua lokasi
          </button>
          <button className={`select-tile ${remoteOnly ? 'active' : ''}`} onClick={() => setRemoteOnly(true)}>
            🏠 Remote saja
          </button>
        </div>
        <button className="btn btn-primary block mt20" onClick={() => setSheet(false)}>
          Terapkan
        </button>
      </Sheet>
    </div>
  )
}
