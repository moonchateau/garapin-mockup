import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronRight, Clock, FileText, Image, Paperclip, Send, Trash2, UploadCloud } from 'lucide-react'
import { BRANDS } from '../../data/mock'
import { useQuestHelpers, useStore } from '../../store/AppStore'
import { labelSisaHari, rupiah, tanggal, waktuLalu } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Avatar, Empty, ProgressBar, Sheet, Stars, StatusBadge, TopBar } from '../../components/ui'
import { QuestCover } from '../../components/QuestCard'

const FAKE_FILES = ['foto-bukti.jpg', 'struk-pembelian.jpg', 'screenshot-unggahan.png', 'link-konten.txt', 'dokumentasi-2.jpg', 'laporan.pdf']

export function FileList({ files, onRemove }) {
  return (
    <div className="stack">
      {files.map((f, i) => {
        const isImg = /\.(jpg|png)$/i.test(f)
        return (
          <div key={i} className="file-row">
            <span className="list-ic" style={{ width: 34, height: 34, background: isImg ? 'var(--info-50)' : 'var(--primary-50)', color: isImg ? 'var(--info)' : 'var(--primary)' }}>
              {isImg ? <Image size={17} /> : <FileText size={17} />}
            </span>
            <span className="grow ellipsis">{f}</span>
            {onRemove && (
              <button onClick={() => onRemove(i)} aria-label="Hapus berkas" className="muted">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Kerjakan() {
  const { pid } = useParams()
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const { participation, quest: getQuest } = useQuestHelpers()
  const p = participation(pid)
  const [note, setNote] = useState(p?.note || '')
  const [files, setFiles] = useState(p?.status === 'revisi' ? p.files : [])
  const [cancelSheet, setCancelSheet] = useState(false)

  if (!p)
    return (
      <Screen>
        <TopBar title="Progres Quest" backTo="/p/quest" />
        <Empty emoji="🤔" title="Quest tidak ditemukan" text="Mungkin sudah dibatalkan." />
      </Screen>
    )

  const q = getQuest(p.questId)
  const brand = BRANDS[q.brandId]
  const done = p.progress.filter(Boolean).length
  const allDone = done === p.progress.length
  const editable = ['berjalan', 'revisi'].includes(p.status)
  const canSubmit = allDone && files.length > 0

  const stepIdx = { berjalan: 1, revisi: 1, ditinjau: 2, selesai: 3 }[p.status]
  const steps = ['Diambil', 'Dikerjakan', 'Ditinjau', 'Dibayar']

  const submit = () => {
    dispatch({ type: 'SUBMIT_WORK', pid: p.id, note, files })
    nav('/sukses', {
      replace: true,
      state: {
        emoji: '📨',
        title: 'Hasil kerja terkirim!',
        text: `${brand.name} akan meninjau hasil kerjamu maksimal 2 hari. Kami kabari lewat notifikasi ya.`,
        primary: { label: 'Lihat Status', to: `/p/kerja/${p.id}` },
        secondary: { label: 'Cari Quest Lain', to: '/p/jelajah' },
      },
    })
  }

  return (
    <Screen
      className={editable ? 'pb-cta' : 'pb-nav'}
      footer={
        editable && (
          <div className="cta-bar">
            <button className="btn btn-primary grow" disabled={!canSubmit} onClick={submit}>
              <Send size={17} /> {p.status === 'revisi' ? 'Kirim Ulang Hasil' : 'Kirim Hasil Kerja'}
            </button>
          </div>
        )
      }
    >
      <TopBar title="Progres Quest" backTo="/p/quest" />
      <div className="pad">
        {/* Ringkasan */}
        <button className="card tap" onClick={() => nav(`/p/quest/${q.id}`)}>
          <div className="row top">
            <QuestCover quest={q} size={48} />
            <div className="grow">
              <div className="row between gap6">
                <span className="xs muted bold">{brand.name}</span>
                <StatusBadge status={p.status} />
              </div>
              <div className="bold clamp2 mt4" style={{ fontSize: 15, lineHeight: 1.35 }}>
                {q.title}
              </div>
            </div>
          </div>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div className="row between xs bold">
            <span className="muted row gap4">
              <Clock size={13} /> Tenggat {tanggal(q.endDate)} · {labelSisaHari(q.endDate)}
            </span>
            <span className="text-primary row gap4">
              Detail <ChevronRight size={14} />
            </span>
          </div>
        </button>

        {/* Langkah */}
        <div className="card mt12">
          <div className="row" style={{ gap: 0 }}>
            {steps.map((s, i) => (
              <div key={s} className="col grow" style={{ alignItems: 'center', position: 'relative' }}>
                {i > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 13,
                      right: '50%',
                      width: '100%',
                      height: 3,
                      background: i <= stepIdx ? 'var(--success)' : 'var(--line)',
                    }}
                  />
                )}
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    zIndex: 1,
                    fontSize: 12,
                    fontWeight: 800,
                    background: i < stepIdx || p.status === 'selesai' ? 'var(--success)' : i === stepIdx ? 'var(--primary)' : '#eceef5',
                    color: i <= stepIdx ? '#fff' : 'var(--muted)',
                  }}
                >
                  {i < stepIdx || p.status === 'selesai' ? <Check size={15} strokeWidth={3} /> : i + 1}
                </span>
                <span className={`xs bold mt4 ${i === stepIdx ? 'text-primary' : 'muted'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Banner status */}
        {p.status === 'revisi' && (
          <div className="banner warning mt12">
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <b>Brand meminta revisi</b>
              <div className="mt4">"{p.revisionNote}"</div>
            </div>
          </div>
        )}
        {p.status === 'ditinjau' && (
          <div className="banner info mt12">
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <b>Hasil kerjamu sedang ditinjau</b>
              <div className="mt4">Dikirim {waktuLalu(p.submittedAt)}. Brand biasanya merespons dalam 1×24 jam.</div>
            </div>
          </div>
        )}

        {/* Selesai: pembayaran & ulasan */}
        {p.status === 'selesai' && (
          <>
            <div className="hero mt12" style={{ background: 'linear-gradient(140deg,#22c58b,#12b76a 50%,#0a8f52)', boxShadow: '0 18px 40px -14px rgba(18,183,106,.5)' }}>
              <div className="small muted-w bold">Pembayaran diterima 🎉</div>
              <div className="xbold mt4" style={{ fontSize: 28 }}>
                +{rupiah(q.budget)}
              </div>
              <div className="xs muted-w mt4">Masuk ke dompet pada {tanggal(p.paidAt)}</div>
            </div>
            {p.review && (
              <div className="card mt12">
                <div className="row">
                  <Avatar name={brand.name} color={brand.color} size={40} square />
                  <div className="grow">
                    <div className="bold small">Ulasan dari {brand.name}</div>
                    <Stars value={p.review.rating} size={15} />
                  </div>
                  <span className="h2">{p.review.rating}.0</span>
                </div>
                <p className="ink2 mt12" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  "{p.review.comment || 'Kerja bagus!'}"
                </p>
                <div className="xs muted mt8">{tanggal(p.review.date)}</div>
              </div>
            )}
            <div className="banner primary mt12">
              <span style={{ fontSize: 18 }}>⚡</span>
              <div>
                Kamu mendapatkan <b>+50 XP</b> dari quest ini. Terus kumpulkan XP untuk naik level dan buka quest eksklusif!
              </div>
            </div>
          </>
        )}

        {/* Checklist */}
        <div className="section-head">
          <h2>Daftar Tugas</h2>
          <span className="small bold text-success">
            {done}/{p.progress.length} selesai
          </span>
        </div>
        <div className="card" style={{ paddingTop: 6, paddingBottom: 6 }}>
          <div style={{ padding: '6px 0 4px' }}>
            <ProgressBar value={done} max={p.progress.length} variant="success" />
          </div>
          {q.objectives.map((o, i) => (
            <button
              key={i}
              className="check-item"
              disabled={!editable}
              onClick={() => dispatch({ type: 'TOGGLE_OBJECTIVE', pid: p.id, index: i })}
              style={{ cursor: editable ? 'pointer' : 'default' }}
            >
              <span className={`checkbox ${p.progress[i] ? 'on' : ''}`}>{p.progress[i] && <Check size={15} strokeWidth={3} />}</span>
              <span className={`txt ${p.progress[i] ? 'done' : ''}`}>{o}</span>
            </button>
          ))}
        </div>
        {editable && !allDone && <p className="xs muted mt8 center">Centang tugas yang sudah kamu selesaikan</p>}

        {/* Form kirim */}
        {editable && (
          <>
            <div className="section-head">
              <h2>Bukti Hasil Kerja</h2>
            </div>
            {!allDone && (
              <div className="banner info mb12">
                <span>🔒</span> Selesaikan semua tugas dulu sebelum mengirim hasil kerja.
              </div>
            )}
            <div style={{ opacity: allDone ? 1 : 0.5, pointerEvents: allDone ? 'auto' : 'none' }}>
              <button
                className="upload"
                onClick={() => {
                  setFiles([...files, FAKE_FILES[files.length % FAKE_FILES.length]])
                  showToast('Berkas berhasil diunggah')
                }}
              >
                <UploadCloud size={28} style={{ marginBottom: 6 }} />
                <div>Unggah foto, video, atau dokumen</div>
                <div className="xs" style={{ fontWeight: 500, opacity: 0.8, marginTop: 2 }}>
                  Ketuk untuk menambah berkas (simulasi)
                </div>
              </button>
              {files.length > 0 && (
                <div className="mt12">
                  <FileList files={files} onRemove={(i) => setFiles(files.filter((_, j) => j !== i))} />
                </div>
              )}
              <label className="field mt16">
                <span>Catatan untuk brand</span>
                <textarea className="input" placeholder="Contoh: Video sudah tayang di TikTok, ini tautannya…" value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
            </div>
            {p.status === 'berjalan' && (
              <button className="btn block small text-danger" style={{ height: 44 }} onClick={() => setCancelSheet(true)}>
                Batalkan quest ini
              </button>
            )}
          </>
        )}

        {/* Hasil yang dikirim */}
        {['ditinjau', 'selesai'].includes(p.status) && (p.files.length > 0 || p.note) && (
          <>
            <div className="section-head">
              <h2>Hasil yang Dikirim</h2>
            </div>
            <div className="card">
              {p.note && (
                <p className="small ink2 mb12" style={{ lineHeight: 1.55 }}>
                  <Paperclip size={13} /> {p.note}
                </p>
              )}
              <FileList files={p.files} />
            </div>
          </>
        )}
      </div>

      <Sheet open={cancelSheet} onClose={() => setCancelSheet(false)} title="Batalkan quest?" subtitle="Slot kamu akan dibuka kembali untuk pekerja lain. Pembatalan terlalu sering dapat menurunkan reputasimu.">
        <div className="row mt8">
          <button className="btn btn-ghost grow" onClick={() => setCancelSheet(false)}>
            Tidak jadi
          </button>
          <button
            className="btn btn-danger-soft grow"
            onClick={() => {
              dispatch({ type: 'CANCEL_PARTICIPATION', pid: p.id })
              showToast('Quest dibatalkan', 'info')
              nav('/p/quest', { replace: true })
            }}
          >
            Ya, batalkan
          </button>
        </div>
      </Sheet>
    </Screen>
  )
}
