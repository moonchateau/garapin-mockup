import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Lightbulb, Pencil } from 'lucide-react'
import { useQuestHelpers, useStore, useWorkerFinance } from '../../store/AppStore'
import { angka, hariIni, rupiah, rupiahSingkat, sisaHari, tanggal, toInputDate } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Empty, Ring, Sheet, TopBar } from '../../components/ui'
import QuestCard from '../../components/QuestCard'

const EMOJIS = ['💻', '📱', '🏍️', '✈️', '🏠', '🎓', '💍', '🛟', '🎮', '📷']

function TargetForm({ initial, onSave }) {
  const [emoji, setEmoji] = useState(initial?.emoji || '🎯')
  const [name, setName] = useState(initial?.name || '')
  const [amount, setAmount] = useState(initial?.amount || 0)
  const [deadline, setDeadline] = useState(toInputDate(initial?.deadline || hariIni(90)))
  return (
    <>
      <div className="small bold mt12 mb8">Pilih ikon</div>
      <div className="row wrap" style={{ gap: 8 }}>
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              fontSize: 22,
              border: `2px solid ${emoji === e ? 'var(--primary)' : 'var(--line)'}`,
              background: emoji === e ? 'var(--primary-50)' : 'var(--surface)',
            }}
          >
            {e}
          </button>
        ))}
      </div>
      <label className="field mt16">
        <span>Nama target</span>
        <input className="input" placeholder="Contoh: Beli motor, Dana darurat" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="field">
        <span>Nominal target</span>
        <div className="input-wrap">
          <span className="prefix">Rp</span>
          <input
            className="input with-prefix"
            inputMode="numeric"
            value={amount ? amount.toLocaleString('id-ID') : ''}
            placeholder="0"
            onChange={(e) => setAmount(angka(e.target.value))}
          />
        </div>
      </label>
      <div className="chips" style={{ marginTop: -6, marginBottom: 14 }}>
        {[1000000, 3000000, 5000000, 10000000].map((v) => (
          <button key={v} className={`chip ${amount === v ? 'active' : ''}`} onClick={() => setAmount(v)}>
            {rupiahSingkat(v)}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Tenggat waktu</span>
        <input className="input" type="date" value={deadline} min={toInputDate(hariIni(1))} onChange={(e) => setDeadline(e.target.value)} />
      </label>
      <button
        className="btn btn-primary block"
        disabled={!name.trim() || amount < 10000}
        onClick={() =>
          onSave({
            emoji,
            name: name.trim(),
            amount,
            deadline: new Date(deadline).toISOString(),
            createdAt: initial?.createdAt || new Date().toISOString(),
          })
        }
      >
        Simpan Target
      </button>
    </>
  )
}

export default function Target() {
  const nav = useNavigate()
  const { state, dispatch, showToast } = useStore()
  const fin = useWorkerFinance()
  const { filled, myParticipation } = useQuestHelpers()
  const [edit, setEdit] = useState(false)
  const t = state.target

  const save = (target) => {
    dispatch({ type: 'SET_TARGET', target })
    setEdit(false)
    showToast('Target keuangan disimpan')
  }

  if (!t)
    return (
      <Screen>
        <TopBar title="Target Keuangan" />
        <Empty
          emoji="🎯"
          title="Belum ada target"
          text="Pasang target supaya kamu tahu berapa quest yang perlu diselesaikan untuk mewujudkannya."
          action={
            <button className="btn btn-primary" onClick={() => setEdit(true)}>
              Buat Target
            </button>
          }
        />
        <Sheet open={edit} onClose={() => setEdit(false)} title="Buat target baru">
          <TargetForm onSave={save} />
        </Sheet>
      </Screen>
    )

  const saved = fin.targetSaved
  const pct = Math.min(100, Math.round((saved / t.amount) * 100))
  const remaining = Math.max(0, t.amount - saved)
  const days = Math.max(1, sisaHari(t.deadline))
  const weeks = Math.max(1, Math.ceil(days / 7))
  const perWeek = remaining / weeks
  const questsLeft = Math.ceil(remaining / fin.avgPay)
  const onTrack = perWeek <= fin.avgPay * 1.5

  const suggestions = state.quests
    .filter((q) => q.status === 'aktif' && !myParticipation(q.id) && filled(q) < q.slots)
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 2)

  const milestones = [25, 50, 75, 100]

  return (
    <Screen className="pb-nav">
      <TopBar
        title="Target Keuangan"
        right={
          <button className="icon-btn solid" onClick={() => setEdit(true)} aria-label="Ubah target">
            <Pencil size={18} />
          </button>
        }
      />
      <div className="pad">
        <div className="card center" style={{ paddingTop: 24, paddingBottom: 20 }}>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Ring value={saved} max={t.amount} size={168} stroke={14} color="url(#g)">
              <div style={{ fontSize: 30 }}>{t.emoji}</div>
              <div className="h1" style={{ fontSize: 28 }}>
                {pct}%
              </div>
              <div className="xs muted bold">tercapai</div>
            </Ring>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFB020" />
                  <stop offset="100%" stopColor="#5B3DF5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="h2 mt16">{t.name}</h2>
          <div className="small muted bold mt4 row" style={{ justifyContent: 'center', gap: 4 }}>
            <CalendarDays size={14} /> Tenggat {tanggal(t.deadline)} · {days} hari lagi
          </div>
          <div className="row mt20" style={{ gap: 8 }}>
            <div className="info-tile grow" style={{ textAlign: 'left' }}>
              <div className="k">Terkumpul</div>
              <div className="v text-success">{rupiah(saved)}</div>
            </div>
            <div className="info-tile grow" style={{ textAlign: 'left' }}>
              <div className="k">Target</div>
              <div className="v">{rupiah(t.amount)}</div>
            </div>
          </div>
        </div>

        {/* Pencapaian */}
        <div className="card mt12">
          <div className="bold small mb12">Pencapaian</div>
          <div className="row between">
            {milestones.map((m) => {
              const ok = pct >= m
              return (
                <div key={m} className="col" style={{ alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 20,
                      background: ok ? 'var(--accent-50)' : '#f0f1f6',
                      filter: ok ? 'none' : 'grayscale(1)',
                      opacity: ok ? 1 : 0.55,
                    }}
                  >
                    {m === 100 ? '🏆' : m === 75 ? '🥇' : m === 50 ? '🥈' : '🥉'}
                  </span>
                  <span className={`xs bold ${ok ? '' : 'muted'}`}>{m}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rencana */}
        {remaining > 0 ? (
          <div className="card mt12">
            <div className="row mb12">
              <span className="list-ic" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
                <Lightbulb size={19} />
              </span>
              <div className="grow">
                <div className="bold small">Rencana mencapai target</div>
                <div className="xs muted">Berdasarkan rata-rata bayaran quest kamu ({rupiahSingkat(fin.avgPay)})</div>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-tile" style={{ background: 'var(--bg)', border: 0 }}>
                <div className="k">Kekurangan</div>
                <div className="v">{rupiahSingkat(remaining)}</div>
              </div>
              <div className="info-tile" style={{ background: 'var(--bg)', border: 0 }}>
                <div className="k">Per minggu</div>
                <div className="v">{rupiahSingkat(perWeek)}</div>
              </div>
            </div>
            <div className={`banner ${onTrack ? 'success' : 'warning'} mt12`}>
              <span>{onTrack ? '💪' : '⚡'}</span>
              <div>
                Selesaikan <b>± {questsLeft} quest lagi</b> dalam {weeks} minggu.{' '}
                {onTrack ? 'Kamu berada di jalur yang tepat!' : 'Ambil quest dengan bayaran lebih besar biar makin cepat.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="banner success mt12">
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <b>Selamat! Target tercapai.</b> Saatnya pasang target baru yang lebih besar.
            </div>
          </div>
        )}

        {suggestions.length > 0 && remaining > 0 && (
          <>
            <div className="section-head">
              <h2>Quest untuk Percepat Targetmu</h2>
            </div>
            <div className="stack">
              {suggestions.map((q) => (
                <QuestCard key={q.id} quest={q} showSlots={false} />
              ))}
            </div>
            <button className="btn btn-soft block mt12" onClick={() => nav('/p/jelajah?urut=bayaran')}>
              Lihat quest lainnya
            </button>
          </>
        )}
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Ubah target">
        <TargetForm initial={t} onSave={save} />
      </Sheet>
    </Screen>
  )
}
