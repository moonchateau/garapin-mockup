import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Minus, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { BRANDS, KATEGORI, ME_BRAND, kategoriById } from '../../data/mock'
import { useBrandFinance, useQuestHelpers, useStore } from '../../store/AppStore'
import { angka, hariIni, rupiah, rupiahSingkat, tanggal, toInputDate, uid } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Avatar, Sheet, TopBar } from '../../components/ui'

const STEPS = ['Info Dasar', 'Tugas & Syarat', 'Jadwal & Slot', 'Anggaran', 'Tinjau']

const CONTOH = {
  title: 'Foto Estetik Interior Gerai Baru Kopi Senja',
  category: 'konten',
  description:
    'Kami membuka gerai baru di Bintaro! Kunjungi gerai, ambil foto interior dan menu yang estetik, lalu unggah ke Instagram dengan caption menarik.',
  location: 'Bintaro, Tangerang Selatan',
  objectives: ['Kunjungi gerai Kopi Senja Bintaro', 'Ambil minimal 10 foto interior & menu', 'Unggah 1 post carousel di Instagram', 'Tag @kopisenja.id dan lokasi gerai'],
  requirements: ['Aktif di Instagram (min. 500 pengikut)', 'Domisili Tangerang Selatan atau Jakarta Selatan', 'Punya HP dengan kamera yang bagus'],
  slots: 6,
  budget: 175000,
}

function ListEditor({ items, onChange, placeholder, numbered }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    if (!draft.trim()) return
    onChange([...items, draft.trim()])
    setDraft('')
  }
  return (
    <>
      {items.map((it, i) => (
        <div key={i} className="file-row mb8" style={{ background: 'var(--surface)', border: '1px solid var(--line)', alignItems: 'flex-start' }}>
          <span
            className="b"
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 800,
              background: numbered ? 'var(--primary-50)' : 'var(--success-50)',
              color: numbered ? 'var(--primary)' : 'var(--success)',
            }}
          >
            {numbered ? i + 1 : <Check size={13} strokeWidth={3} />}
          </span>
          <span className="grow" style={{ fontWeight: 500, lineHeight: 1.45 }}>
            {it}
          </span>
          <button className="muted" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Hapus">
            <X size={16} />
          </button>
        </div>
      ))}
      <div className="row" style={{ gap: 8 }}>
        <input className="input grow" placeholder={placeholder} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className="icon-btn" style={{ width: 50, height: 50, borderRadius: 13, background: 'var(--primary)', color: '#fff' }} onClick={add} aria-label="Tambah">
          <Plus size={20} />
        </button>
      </div>
    </>
  )
}

export default function BuatQuest() {
  const { id } = useParams()
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const { quest: getQuest } = useQuestHelpers()
  const fin = useBrandFinance()
  const existing = id ? getQuest(id) : null

  const [step, setStep] = useState(0)
  const [exitSheet, setExitSheet] = useState(false)
  const [f, setF] = useState(
    () =>
      existing || {
        title: '',
        category: '',
        description: '',
        location: '',
        remote: false,
        objectives: [],
        requirements: [],
        startDate: hariIni(0),
        endDate: hariIni(14),
        slots: 5,
        budget: 0,
      },
  )
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const isRemote = f.location === 'Remote'
  const total = f.slots * f.budget
  const fee = Math.round(total * 0.05)
  const grand = total + fee
  const enough = fin.balance >= grand

  const valid = [
    f.title.trim().length >= 5 && f.category && f.description.trim().length >= 10 && f.location.trim(),
    f.objectives.length > 0 && f.requirements.length > 0,
    f.slots > 0 && new Date(f.endDate) >= new Date(f.startDate),
    f.budget >= 10000,
    enough,
  ]

  const save = (status) => {
    const quest = {
      baseFilled: 0,
      createdAt: new Date().toISOString(),
      ...f,
      id: existing?.id || uid('q'),
      brandId: ME_BRAND,
      status,
    }
    dispatch({ type: 'SAVE_QUEST', quest })
    if (status === 'draf') {
      showToast('Quest disimpan sebagai draf')
      nav('/b/quest?tab=draf', { replace: true })
    } else {
      nav('/sukses', {
        replace: true,
        state: {
          emoji: '📢',
          title: 'Quest berhasil diterbitkan!',
          text: `"${quest.title}" sekarang bisa dilihat oleh ribuan pekerja. Kami kabari saat ada yang mengambil quest ini.`,
          primary: { label: 'Kelola Quest', to: `/b/quest/${quest.id}` },
          secondary: { label: 'Kembali ke Beranda', to: '/b/beranda' },
          confetti: true,
        },
      })
    }
  }

  const back = () => (step > 0 ? setStep(step - 1) : setExitSheet(true))
  const k = f.category ? kategoriById(f.category) : null

  return (
    <Screen
      className="pb-cta"
      footer={
        <div className="cta-bar">
          {step === 4 ? (
            <>
              <button className="btn btn-ghost" onClick={() => save('draf')}>
                Simpan Draf
              </button>
              <button className="btn btn-primary grow" disabled={!enough} onClick={() => save('aktif')}>
                Terbitkan Quest
              </button>
            </>
          ) : (
            <button className="btn btn-primary grow" disabled={!valid[step]} onClick={() => setStep(step + 1)}>
              Lanjut · {STEPS[step + 1]}
            </button>
          )}
        </div>
      }
    >
      <TopBar
        title={existing ? 'Edit Draf Quest' : 'Buat Quest Baru'}
        variant="surface"
        onBack={back}
        right={
          step === 0 && !existing ? (
            <button
              className="btn sm btn-soft"
              onClick={() => {
                setF((s) => ({ ...s, ...CONTOH }))
                showToast('Formulir diisi dengan contoh', 'info')
              }}
            >
              <Sparkles size={14} /> Isi contoh
            </button>
          ) : null
        }
      />
      <div style={{ background: 'var(--surface)', padding: '4px 16px 14px', borderBottom: '1px solid var(--line)' }}>
        <div className="steps">
          {STEPS.map((s, i) => (
            <i key={s} className={i <= step ? 'on' : ''} />
          ))}
        </div>
        <div className="row between mt8 xs bold">
          <span className="text-primary">
            Langkah {step + 1} dari {STEPS.length}
          </span>
          <span className="muted">{STEPS[step]}</span>
        </div>
      </div>

      <div className="pad" style={{ paddingTop: 18 }} key={step}>
        <div className="anim-rise">
          {step === 0 && (
            <>
              <label className="field">
                <span>Judul quest</span>
                <input className="input" placeholder="Contoh: Review menu baru di gerai kami" value={f.title} onChange={(e) => set('title', e.target.value)} />
              </label>
              <div className="field">
                <span>Kategori</span>
                <div className="select-grid">
                  {KATEGORI.map((c) => (
                    <button key={c.id} className={`select-tile ${f.category === c.id ? 'active' : ''}`} onClick={() => set('category', c.id)}>
                      <span style={{ fontSize: 20 }}>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="field">
                <span>Deskripsi</span>
                <textarea
                  className="input"
                  placeholder="Jelaskan tujuan quest, apa yang harus dilakukan pekerja, dan hasil yang kamu harapkan…"
                  value={f.description}
                  onChange={(e) => set('description', e.target.value)}
                />
                <div className="hint">{f.description.length}/500 karakter</div>
              </label>
              <div className="field">
                <span>Lokasi pengerjaan</span>
                <div className="select-grid mb8">
                  <button className={`select-tile ${!isRemote ? 'active' : ''}`} onClick={() => set('location', isRemote ? '' : f.location)}>
                    📍 Di lokasi
                  </button>
                  <button className={`select-tile ${isRemote ? 'active' : ''}`} onClick={() => set('location', 'Remote')}>
                    🏠 Remote
                  </button>
                </div>
                {!isRemote && <input className="input" placeholder="Contoh: Jakarta Selatan" value={f.location} onChange={(e) => set('location', e.target.value)} />}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="field">
                <span>Tugas yang harus diselesaikan</span>
                <p className="xs muted mb12" style={{ marginTop: -2 }}>
                  Pekerja akan mencentang setiap tugas ini sebagai progres.
                </p>
                <ListEditor items={f.objectives} onChange={(v) => set('objectives', v)} placeholder="Tambah tugas…" numbered />
              </div>
              <div className="field mt20">
                <span>Persyaratan pekerja</span>
                <p className="xs muted mb12" style={{ marginTop: -2 }}>
                  Kriteria yang harus dipenuhi pekerja sebelum mengambil quest.
                </p>
                <ListEditor items={f.requirements} onChange={(v) => set('requirements', v)} placeholder="Tambah persyaratan…" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="row" style={{ gap: 10 }}>
                <label className="field grow">
                  <span>Tanggal mulai</span>
                  <input className="input" type="date" value={toInputDate(f.startDate)} onChange={(e) => set('startDate', new Date(e.target.value).toISOString())} />
                </label>
                <label className="field grow">
                  <span>Batas pengumpulan</span>
                  <input className="input" type="date" value={toInputDate(f.endDate)} onChange={(e) => set('endDate', new Date(e.target.value).toISOString())} />
                </label>
              </div>
              {new Date(f.endDate) < new Date(f.startDate) && <p className="xs text-danger" style={{ marginTop: -8, marginBottom: 12 }}>Batas pengumpulan harus setelah tanggal mulai.</p>}
              <div className="field">
                <span>Jumlah slot pekerja</span>
                <div className="stepper">
                  <button onClick={() => set('slots', Math.max(1, f.slots - 1))} aria-label="Kurangi">
                    <Minus size={20} />
                  </button>
                  <span className="val">{f.slots} pekerja</span>
                  <button onClick={() => set('slots', Math.min(100, f.slots + 1))} aria-label="Tambah">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="hint">Slot = jumlah pekerja yang dibutuhkan. Quest otomatis tertutup saat slot penuh.</div>
              </div>
              <div className="chips">
                {[1, 3, 5, 10, 20, 50].map((n) => (
                  <button key={n} className={`chip ${f.slots === n ? 'active' : ''}`} onClick={() => set('slots', n)}>
                    {n} slot
                  </button>
                ))}
              </div>
              <div className="card mt20">
                <div className="bold small mb12">Pratinjau timeline</div>
                <div className="timeline">
                  <div className="tl-item done">
                    <div className="t">Quest dibuka</div>
                    <div className="d">{tanggal(f.startDate)}</div>
                  </div>
                  <div className="tl-item now">
                    <div className="t">Batas pengumpulan hasil</div>
                    <div className="d">{tanggal(f.endDate)}</div>
                  </div>
                  <div className="tl-item">
                    <div className="t">Tinjau & bayar pekerja</div>
                    <div className="d">Maks. 2 hari setelah hasil dikirim</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label className="field">
                <span>Bayaran per pekerja</span>
                <div className="input-wrap">
                  <span className="prefix">Rp</span>
                  <input
                    className="input with-prefix"
                    style={{ fontSize: 20, fontWeight: 800, height: 58 }}
                    inputMode="numeric"
                    placeholder="0"
                    value={f.budget ? f.budget.toLocaleString('id-ID') : ''}
                    onChange={(e) => set('budget', angka(e.target.value))}
                  />
                </div>
                <div className="hint">Rekomendasi untuk kategori ini: Rp100.000 – Rp350.000</div>
              </label>
              <div className="chips" style={{ marginTop: -6 }}>
                {[100000, 150000, 250000, 500000].map((v) => (
                  <button key={v} className={`chip ${f.budget === v ? 'active' : ''}`} onClick={() => set('budget', v)}>
                    {rupiahSingkat(v)}
                  </button>
                ))}
              </div>
              <div className="card mt20">
                <div className="bold small mb12">Rincian anggaran</div>
                {[
                  ['Bayaran per pekerja', rupiah(f.budget)],
                  ['Jumlah slot', `× ${f.slots}`],
                  ['Subtotal', rupiah(total)],
                  ['Biaya layanan (5%)', rupiah(fee)],
                ].map(([a, b]) => (
                  <div key={a} className="row between small" style={{ padding: '5px 0' }}>
                    <span className="muted bold">{a}</span>
                    <span className="bold">{b}</span>
                  </div>
                ))}
                <div className="divider" style={{ margin: '10px 0' }} />
                <div className="row between">
                  <span className="bold">Total anggaran</span>
                  <span className="h2 text-primary">{rupiah(grand)}</span>
                </div>
              </div>
              <div className="banner info mt12">
                <span>🔒</span>
                <div>Dana ditahan aman di Garapin dan baru dibayarkan ke pekerja setelah kamu menyetujui hasil kerjanya. Sisa slot dikembalikan saat quest ditutup.</div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(135deg, ${k.color}33, ${k.color}10)`, padding: '18px 16px', fontSize: 40 }}>{k.emoji}</div>
                <div style={{ padding: 16 }}>
                  <div className="row">
                    <Avatar name={BRANDS[ME_BRAND].name} color={BRANDS[ME_BRAND].color} size={26} square />
                    <span className="xs muted bold">{BRANDS[ME_BRAND].name}</span>
                    <span className="badge primary" style={{ marginLeft: 'auto' }}>
                      {k.label}
                    </span>
                  </div>
                  <h2 className="h3 mt12">{f.title}</h2>
                  <p className="small ink2 mt8" style={{ lineHeight: 1.55 }}>
                    {f.description}
                  </p>
                  <div className="info-grid mt12">
                    {[
                      ['Bayaran', rupiah(f.budget)],
                      ['Slot', `${f.slots} pekerja`],
                      ['Lokasi', f.location],
                      ['Tenggat', tanggal(f.endDate)],
                    ].map(([a, b]) => (
                      <div key={a} className="info-tile" style={{ background: 'var(--bg)', border: 0 }}>
                        <div className="k">{a}</div>
                        <div className="v ellipsis" style={{ fontSize: 13.5 }}>
                          {b}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {[
                ['Tugas', f.objectives, 1],
                ['Persyaratan', f.requirements, 2],
              ].map(([label, items, s]) => (
                <div key={label} className="card mt12">
                  <div className="row between mb8">
                    <span className="bold small">
                      {label} ({items.length})
                    </span>
                    <button className="link" onClick={() => setStep(s)}>
                      Ubah
                    </button>
                  </div>
                  {items.map((o, i) => (
                    <div key={i} className="bullet small">
                      • {o}
                    </div>
                  ))}
                </div>
              ))}

              <div className="card mt12">
                <div className="row between">
                  <span className="bold small">Total dana ditahan</span>
                  <span className="h3 text-primary">{rupiah(grand)}</span>
                </div>
                <div className="row between xs mt8">
                  <span className="muted bold">Saldo brand saat ini</span>
                  <span className={`bold ${enough ? '' : 'text-danger'}`}>{rupiah(fin.balance)}</span>
                </div>
              </div>
              {!enough && (
                <div className="banner warning mt12">
                  <span>⚠️</span>
                  <div>
                    Saldo tidak cukup.{' '}
                    <button className="bold" style={{ textDecoration: 'underline' }} onClick={() => nav('/b/topup')}>
                      Top up sekarang
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Sheet open={exitSheet} onClose={() => setExitSheet(false)} title="Keluar dari pembuatan quest?" subtitle="Perubahan yang belum disimpan akan hilang.">
        <div className="stack mt8">
          <button
            className="btn btn-soft block"
            disabled={!f.title.trim() || !f.category}
            onClick={() => {
              setExitSheet(false)
              save('draf')
            }}
          >
            Simpan sebagai Draf
          </button>
          <button className="btn btn-danger-soft block" onClick={() => nav(-1)}>
            <Trash2 size={16} /> Buang & Keluar
          </button>
        </div>
      </Sheet>
    </Screen>
  )
}
