import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronRight, MapPin, MessageCircle, RotateCcw, Star } from 'lucide-react'
import { WORKERS } from '../../data/mock'
import { useQuestHelpers, useStore } from '../../store/AppStore'
import { rupiah, tanggal, waktuLalu } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Avatar, Empty, ProgressBar, Sheet, Stars, StatusBadge, TopBar } from '../../components/ui'
import { FileList } from '../pekerja/Kerjakan'

const QUICK_TAGS = ['Tepat waktu', 'Kualitas bagus', 'Komunikatif', 'Kreatif', 'Sesuai brief', 'Profesional']
const RATING_LABEL = ['', 'Kurang', 'Cukup', 'Baik', 'Sangat baik', 'Luar biasa!']

export default function TinjauPekerja() {
  const { pid } = useParams()
  const nav = useNavigate()
  const { state, dispatch, showToast } = useStore()
  const { participation, quest: getQuest } = useQuestHelpers()
  const [approve, setApprove] = useState(false)
  const [revise, setRevise] = useState(false)
  const [rating, setRating] = useState(5)
  const [tags, setTags] = useState(['Kualitas bagus'])
  const [comment, setComment] = useState('')
  const [revNote, setRevNote] = useState('')
  const p = participation(pid)

  if (!p)
    return (
      <Screen>
        <TopBar title="Tinjau Pekerja" />
        <Empty emoji="🤔" title="Data tidak ditemukan" />
      </Screen>
    )

  const q = getQuest(p.questId)
  const w = WORKERS[p.workerId]
  const done = p.progress.filter(Boolean).length
  const workerDone = state.participations.filter((x) => x.workerId === w.id && x.status === 'selesai').length + 12

  const pay = () => {
    const finalComment = [comment.trim(), tags.length ? tags.join(' · ') : ''].filter(Boolean).join('\n')
    dispatch({ type: 'APPROVE_WORK', pid: p.id, rating, comment: finalComment })
    setApprove(false)
    const nextPending = state.participations.find((x) => x.id !== p.id && x.questId === q.id && x.status === 'ditinjau')
    nav('/sukses', {
      replace: true,
      state: {
        emoji: '💸',
        title: 'Pembayaran terkirim!',
        text: `${rupiah(q.budget)} sudah dikirim ke ${w.name} beserta ulasan ${rating} bintang darimu.`,
        primary: nextPending ? { label: 'Tinjau Pekerja Berikutnya', to: `/b/tinjau/${nextPending.id}` } : { label: 'Kembali ke Quest', to: `/b/quest/${q.id}` },
        secondary: { label: 'Ke Beranda', to: '/b/beranda' },
        confetti: true,
      },
    })
  }

  return (
    <Screen
      className={p.status === 'ditinjau' ? 'pb-cta' : 'pb-nav'}
      footer={
        p.status === 'ditinjau' && (
          <div className="cta-bar">
            <button className="btn btn-ghost" onClick={() => setRevise(true)}>
              <RotateCcw size={16} /> Revisi
            </button>
            <button className="btn btn-success grow" onClick={() => setApprove(true)}>
              <Check size={18} strokeWidth={3} /> Setujui & Bayar
            </button>
          </div>
        )
      }
    >
      <TopBar title="Tinjau Hasil Kerja" backTo={`/b/quest/${q.id}`} />
      <div className="pad">
        <div className="card">
          <div className="row">
            <Avatar name={w.name} color={w.color} size={54} />
            <div className="grow">
              <div className="h3">{w.name}</div>
              <div className="xs muted bold row gap4 mt4">
                <MapPin size={12} /> {w.city}
              </div>
              <div className="row mt4" style={{ gap: 6 }}>
                <span className="badge accent">
                  <Star size={11} fill="currentColor" /> {w.rating}
                </span>
                <span className="badge primary">Lv. {w.level}</span>
                <span className="badge neutral">{workerDone} quest</span>
              </div>
            </div>
          </div>
          <div className="row wrap mt12" style={{ gap: 6 }}>
            {(w.skills || []).map((s) => (
              <span key={s} className="tag" style={{ background: 'var(--bg)', padding: '4px 10px', borderRadius: 8 }}>
                {s}
              </span>
            ))}
          </div>
          <button className="btn btn-soft block sm mt12" onClick={() => showToast('Fitur chat segera hadir', 'info')}>
            <MessageCircle size={16} /> Kirim Pesan
          </button>
        </div>

        <button className="card tap mt12 row" onClick={() => nav(`/b/quest/${q.id}`)}>
          <div className="grow">
            <div className="xs muted bold">Quest</div>
            <div className="bold small ellipsis">{q.title}</div>
          </div>
          <StatusBadge status={p.status} />
          <ChevronRight size={18} color="var(--muted)" />
        </button>

        {p.status === 'berjalan' && (
          <div className="banner info mt12">
            <span>🛠️</span>
            <div>Pekerja masih mengerjakan quest ini. Kamu bisa meninjau setelah hasil kerja dikirim.</div>
          </div>
        )}
        {p.status === 'revisi' && (
          <div className="banner warning mt12">
            <span>↩️</span>
            <div>
              <b>Menunggu revisi dari pekerja</b>
              <div className="mt4">Catatanmu: "{p.revisionNote}"</div>
            </div>
          </div>
        )}

        <div className="section-head">
          <h2>Progres Tugas</h2>
          <span className="small bold text-success">
            {done}/{p.progress.length}
          </span>
        </div>
        <div className="card" style={{ paddingTop: 6, paddingBottom: 6 }}>
          <div style={{ padding: '6px 0 4px' }}>
            <ProgressBar value={done} max={p.progress.length} variant="success" thin />
          </div>
          {q.objectives.map((o, i) => (
            <div key={i} className="check-item">
              <span className={`checkbox ${p.progress[i] ? 'on' : ''}`}>{p.progress[i] && <Check size={15} strokeWidth={3} />}</span>
              <span className={`txt ${p.progress[i] ? '' : 'muted'}`}>{o}</span>
            </div>
          ))}
        </div>

        {(p.files.length > 0 || p.note) && (
          <>
            <div className="section-head">
              <h2>Hasil Kerja</h2>
              {p.submittedAt && <span className="xs muted bold">{waktuLalu(p.submittedAt)}</span>}
            </div>
            <div className="card">
              {p.note && (
                <div className="mb12" style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 12px' }}>
                  <div className="xs muted bold mb8" style={{ marginBottom: 4 }}>
                    Catatan pekerja
                  </div>
                  <p className="small" style={{ lineHeight: 1.55 }}>
                    {p.note}
                  </p>
                </div>
              )}
              <div className="row mb12" style={{ gap: 8 }}>
                {p.files
                  .filter((x) => /\.(jpg|png)$/i.test(x))
                  .slice(0, 3)
                  .map((x, i) => (
                    <div
                      key={i}
                      className="grow"
                      style={{
                        aspectRatio: '1',
                        borderRadius: 12,
                        background: ['linear-gradient(135deg,#ffd6a5,#fdffb6)', 'linear-gradient(135deg,#caffbf,#9bf6ff)', 'linear-gradient(135deg,#bdb2ff,#ffc6ff)'][i],
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 26,
                      }}
                    >
                      🖼️
                    </div>
                  ))}
              </div>
              <FileList files={p.files} />
            </div>
          </>
        )}

        {p.status === 'selesai' && (
          <>
            <div className="section-head">
              <h2>Pembayaran & Ulasan</h2>
            </div>
            <div className="card">
              <div className="row between">
                <span className="small muted bold">Dibayar {tanggal(p.paidAt)}</span>
                <span className="bold text-success">{rupiah(q.budget)}</span>
              </div>
              {p.review && (
                <>
                  <div className="divider" />
                  <Stars value={p.review.rating} size={16} />
                  <p className="small ink2 mt8" style={{ lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                    {p.review.comment}
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <Sheet open={approve} onClose={() => setApprove(false)} title="Setujui & beri ulasan" subtitle={`Bagaimana hasil kerja ${w.name.split(' ')[0]}?`}>
        <div className="center mt8">
          <Stars value={rating} size={36} onChange={setRating} large />
          <div className="bold mt8" style={{ color: 'var(--warning)' }}>
            {RATING_LABEL[rating]}
          </div>
        </div>
        <div className="row wrap mt16" style={{ gap: 6, justifyContent: 'center' }}>
          {QUICK_TAGS.map((t) => (
            <button key={t} className={`chip ${tags.includes(t) ? 'active' : ''}`} style={{ height: 32 }} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>
              {t}
            </button>
          ))}
        </div>
        <label className="field mt16">
          <span>Komentar (opsional)</span>
          <textarea className="input" style={{ minHeight: 80 }} placeholder="Ceritakan pengalamanmu bekerja dengan pekerja ini…" value={comment} onChange={(e) => setComment(e.target.value)} />
        </label>
        <div className="card flat row between" style={{ background: 'var(--success-50)', border: 0 }}>
          <span className="small bold" style={{ color: '#0b7a47' }}>
            Dibayarkan ke {w.name.split(' ')[0]}
          </span>
          <span className="h3 text-success">{rupiah(q.budget)}</span>
        </div>
        <button className="btn btn-success block mt16" onClick={pay}>
          Bayar & Kirim Ulasan
        </button>
      </Sheet>

      <Sheet open={revise} onClose={() => setRevise(false)} title="Minta revisi" subtitle="Jelaskan bagian yang perlu diperbaiki agar pekerja bisa segera merevisi.">
        <div className="row wrap mb12" style={{ gap: 6 }}>
          {['Foto kurang jelas', 'Tag/tagar belum sesuai', 'Durasi video kurang', 'Bukti belum lengkap'].map((t) => (
            <button key={t} className="chip" style={{ height: 32 }} onClick={() => setRevNote(revNote ? `${revNote}. ${t}` : t)}>
              + {t}
            </button>
          ))}
        </div>
        <textarea className="input" placeholder="Contoh: Mohon unggah ulang video dengan durasi minimal 30 detik…" value={revNote} onChange={(e) => setRevNote(e.target.value)} />
        <button
          className="btn btn-primary block mt16"
          disabled={!revNote.trim()}
          onClick={() => {
            dispatch({ type: 'REQUEST_REVISION', pid: p.id, note: revNote.trim() })
            setRevise(false)
            showToast('Permintaan revisi terkirim')
          }}
        >
          Kirim Permintaan Revisi
        </button>
      </Sheet>
    </Screen>
  )
}
