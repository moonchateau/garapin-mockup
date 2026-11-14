import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, ChevronDown, ChevronRight, MapPin, MoreVertical, Share2, Star, XCircle } from 'lucide-react'
import { WORKERS, kategoriById } from '../../data/mock'
import { useQuestHelpers, useStore } from '../../store/AppStore'
import { labelSisaHari, rupiah, tanggalPendek, waktuLalu } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Avatar, Empty, ProgressBar, Sheet, StatusBadge, TopBar } from '../../components/ui'
import { QuestCover } from '../../components/QuestCard'

const FILTERS = [
  { id: 'semua', label: 'Semua' },
  { id: 'ditinjau', label: 'Perlu Ditinjau' },
  { id: 'berjalan', label: 'Dikerjakan' },
  { id: 'selesai', label: 'Selesai' },
]

export default function KelolaQuest() {
  const { id } = useParams()
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const { quest: getQuest, participantsOf, filled } = useQuestHelpers()
  const [filter, setFilter] = useState('semua')
  const [menu, setMenu] = useState(false)
  const [closeSheet, setCloseSheet] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const q = getQuest(id)

  if (!q)
    return (
      <Screen>
        <TopBar title="Kelola Quest" backTo="/b/quest" />
        <Empty emoji="🤔" title="Quest tidak ditemukan" />
      </Screen>
    )

  const parts = participantsOf(q.id)
  const by = (s) => parts.filter((p) => (Array.isArray(s) ? s.includes(p.status) : p.status === s))
  const counts = { berjalan: by(['berjalan', 'revisi']).length, ditinjau: by('ditinjau').length, selesai: by('selesai').length }
  const list = filter === 'semua' ? parts : filter === 'berjalan' ? by(['berjalan', 'revisi']) : by(filter)
  const order = { ditinjau: 0, revisi: 1, berjalan: 2, selesai: 3 }
  const sorted = [...list].sort((a, b) => order[a.status] - order[b.status])
  const f = filled(q)
  const paid = counts.selesai * q.budget
  const totalBudget = q.slots * q.budget
  const k = kategoriById(q.category)

  return (
    <Screen
      className={q.status === 'aktif' ? 'pb-cta' : 'pb-nav'}
      footer={
        q.status === 'aktif' && (
          <div className="cta-bar">
            <button className="btn btn-ghost" onClick={() => setCloseSheet(true)}>
              Tutup Quest
            </button>
            <button
              className="btn btn-primary grow"
              disabled={counts.ditinjau === 0}
              onClick={() => nav(`/b/tinjau/${by('ditinjau')[0].id}`)}
            >
              {counts.ditinjau > 0 ? `Tinjau ${counts.ditinjau} Hasil Kerja` : 'Tidak ada yang perlu ditinjau'}
            </button>
          </div>
        )
      }
    >
      <TopBar
        title="Kelola Quest"
        backTo="/b/quest"
        right={
          <button className="icon-btn" onClick={() => setMenu(true)} aria-label="Menu">
            <MoreVertical size={20} />
          </button>
        }
      />
      <div className="pad">
        <div className="card">
          <div className="row top">
            <QuestCover quest={q} size={50} />
            <div className="grow">
              <div className="row between gap6">
                <span className="xs muted bold">{k.label}</span>
                <StatusBadge status={q.status} />
              </div>
              <div className="bold mt4" style={{ fontSize: 15.5, lineHeight: 1.35 }}>
                {q.title}
              </div>
            </div>
          </div>
          <div className="qmeta">
            <span className="tag">
              <MapPin size={13} /> {q.location}
            </span>
            <span className="tag">
              <CalendarDays size={13} /> {tanggalPendek(q.startDate)} – {tanggalPendek(q.endDate)}
            </span>
          </div>
          <div className="divider" />
          <div className="row between">
            <div>
              <div className="xs muted bold">Slot terisi</div>
              <div className="h2">
                {Math.min(f, q.slots)}
                <span className="muted" style={{ fontSize: 15 }}>
                  /{q.slots}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="xs muted bold">{q.status === 'aktif' ? 'Berakhir' : 'Periode'}</div>
              <div className="bold">{q.status === 'aktif' ? labelSisaHari(q.endDate) : 'Selesai'}</div>
            </div>
          </div>
          <div className="mt8">
            <ProgressBar value={f} max={q.slots} />
          </div>
        </div>

        <div className="stat-grid mt12">
          {[
            ['Dikerjakan', counts.berjalan, 'var(--info)'],
            ['Ditinjau', counts.ditinjau, 'var(--warning)'],
            ['Selesai', counts.selesai, 'var(--success)'],
          ].map(([l, v, c]) => (
            <div key={l} className="stat center">
              <div className="v" style={{ color: c }}>
                {v}
              </div>
              <div className="k">{l}</div>
            </div>
          ))}
        </div>

        <div className="card mt12">
          <div className="row between small">
            <span className="muted bold">Dana terpakai</span>
            <span className="bold">
              {rupiah(paid)} <span className="muted">/ {rupiah(totalBudget)}</span>
            </span>
          </div>
          <div className="mt8">
            <ProgressBar value={paid} max={totalBudget} variant="success" thin />
          </div>
        </div>

        <button className="card tap mt12" onClick={() => setShowDetail(!showDetail)}>
          <div className="row between">
            <span className="bold small">Detail quest</span>
            <ChevronDown size={18} style={{ transform: showDetail ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </div>
          {showDetail && (
            <div className="mt12" style={{ textAlign: 'left' }}>
              <p className="small ink2" style={{ lineHeight: 1.55 }}>
                {q.description}
              </p>
              <div className="bold xs mt12 mb8">TUGAS</div>
              {q.objectives.map((o, i) => (
                <div key={i} className="bullet small">
                  {i + 1}. {o}
                </div>
              ))}
              <div className="bold xs mt12 mb8">PERSYARATAN</div>
              {q.requirements.map((o, i) => (
                <div key={i} className="bullet small">
                  • {o}
                </div>
              ))}
              <div className="row between mt12 small">
                <span className="muted bold">Bayaran per pekerja</span>
                <span className="bold text-primary">{rupiah(q.budget)}</span>
              </div>
            </div>
          )}
        </button>

        <div className="section-head">
          <h2>Pekerja ({parts.length})</h2>
        </div>
        <div className="chips mb12">
          {FILTERS.map((x) => (
            <button key={x.id} className={`chip ${filter === x.id ? 'active' : ''}`} onClick={() => setFilter(x.id)}>
              {x.label}
              {x.id !== 'semua' && counts[x.id] > 0 ? ` (${counts[x.id]})` : ''}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="card">
            <Empty
              emoji="👀"
              title={parts.length === 0 ? 'Belum ada pekerja' : 'Tidak ada pekerja di filter ini'}
              text={parts.length === 0 ? 'Quest kamu sudah tayang. Pekerja yang mengambil quest ini akan muncul di sini.' : undefined}
            />
          </div>
        ) : (
          <div className="menu-group">
            {sorted.map((p) => {
              const w = WORKERS[p.workerId]
              const done = p.progress.filter(Boolean).length
              return (
                <button key={p.id} className="list-item" onClick={() => nav(`/b/tinjau/${p.id}`)}>
                  <Avatar name={w.name} color={w.color} size={42} />
                  <div className="grow">
                    <div className="row between gap6">
                      <span className="bold small ellipsis">{w.name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="xs muted row gap4 mt4">
                      <Star size={11} fill="var(--accent)" color="var(--accent)" /> {w.rating} · Lv.{w.level} ·{' '}
                      {p.status === 'ditinjau' ? `dikirim ${waktuLalu(p.submittedAt)}` : p.status === 'selesai' ? 'sudah dibayar' : `${done}/${p.progress.length} tugas`}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--muted)" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Opsi quest">
        <div className="menu-group mt12">
          <button
            className="list-item"
            onClick={() => {
              setMenu(false)
              showToast('Tautan quest disalin', 'info')
            }}
          >
            <span className="list-ic" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
              <Share2 size={18} />
            </span>
            <span className="bold small grow">Bagikan quest</span>
          </button>
          {q.status === 'aktif' && (
            <button
              className="list-item"
              onClick={() => {
                setMenu(false)
                setCloseSheet(true)
              }}
            >
              <span className="list-ic" style={{ background: 'var(--danger-50)', color: 'var(--danger)' }}>
                <XCircle size={18} />
              </span>
              <span className="bold small grow text-danger">Tutup quest</span>
            </button>
          )}
        </div>
      </Sheet>

      <Sheet
        open={closeSheet}
        onClose={() => setCloseSheet(false)}
        title="Tutup quest ini?"
        subtitle="Quest tidak akan terlihat lagi oleh pekerja baru. Sisa dana dari slot yang tidak terpakai akan dikembalikan ke saldo brand."
      >
        {(counts.berjalan > 0 || counts.ditinjau > 0) && (
          <div className="banner warning mb12">
            <span>⚠️</span>
            <div>
              Masih ada {counts.berjalan + counts.ditinjau} pekerja yang sedang mengerjakan atau menunggu tinjauan.
            </div>
          </div>
        )}
        <div className="card flat row between" style={{ background: 'var(--bg)' }}>
          <span className="small muted bold">Dana dikembalikan</span>
          <span className="bold text-success">{rupiah((q.slots - counts.selesai) * q.budget)}</span>
        </div>
        <div className="row mt16">
          <button className="btn btn-ghost grow" onClick={() => setCloseSheet(false)}>
            Batal
          </button>
          <button
            className="btn btn-danger-soft grow"
            onClick={() => {
              dispatch({ type: 'CLOSE_QUEST', questId: q.id })
              setCloseSheet(false)
              showToast('Quest ditutup & sisa dana dikembalikan')
            }}
          >
            Ya, tutup
          </button>
        </div>
      </Sheet>
    </Screen>
  )
}
