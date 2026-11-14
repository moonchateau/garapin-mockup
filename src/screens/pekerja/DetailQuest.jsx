import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Bookmark, CalendarDays, Check, CheckCircle2, MapPin, Share2, Star, Users, Wallet } from 'lucide-react'
import { BRANDS, WORKERS, kategoriById } from '../../data/mock'
import { useQuestHelpers, useStore } from '../../store/AppStore'
import { labelSisaHari, rupiah, tanggal, tanggalPendek, uid } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Avatar, Empty, Sheet, TopBar, useStatusBar } from '../../components/ui'
import { SlotInfo } from '../../components/QuestCard'

export default function DetailQuest() {
  const { id } = useParams()
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const { quest: getQuest, filled, participantsOf, myParticipation } = useQuestHelpers()
  const [sheet, setSheet] = useState(false)
  const [agree, setAgree] = useState([false, false])
  const [saved, setSaved] = useState(false)
  const quest = getQuest(id)
  const k = quest ? kategoriById(quest.category) : null
  useStatusBar(k ? k.color + '2e' : undefined)

  if (!quest)
    return (
      <Screen>
        <TopBar title="Quest" />
        <Empty emoji="🤔" title="Quest tidak ditemukan" />
      </Screen>
    )

  const brand = BRANDS[quest.brandId]
  const mine = myParticipation(quest.id)
  const f = filled(quest)
  const full = f >= quest.slots
  const closed = quest.status !== 'aktif'
  const people = participantsOf(quest.id).map((p) => WORKERS[p.workerId])

  const take = () => {
    const pid = uid('p')
    dispatch({ type: 'TAKE_QUEST', questId: quest.id, pid })
    setSheet(false)
    nav('/sukses', {
      replace: true,
      state: {
        emoji: '🚀',
        title: 'Quest berhasil diambil!',
        text: `Kamu resmi bergabung di "${quest.title}". Selesaikan semua tugas sebelum ${tanggal(quest.endDate)} ya!`,
        primary: { label: 'Mulai Kerjakan', to: `/p/kerja/${pid}` },
        secondary: { label: 'Kembali ke Beranda', to: '/p/beranda' },
        confetti: true,
      },
    })
  }

  const timeline = [
    { t: 'Pendaftaran dibuka', d: tanggal(quest.startDate), done: true },
    { t: 'Batas pengumpulan hasil', d: `${tanggal(quest.endDate)} · ${labelSisaHari(quest.endDate)}`, now: true },
    { t: 'Peninjauan oleh brand', d: 'Maks. 2 hari setelah hasil dikirim' },
    { t: 'Pembayaran cair ke dompet', d: 'Otomatis setelah hasil disetujui' },
  ]

  let cta
  if (mine)
    cta = (
      <button className="btn btn-primary grow" onClick={() => nav(`/p/kerja/${mine.id}`)}>
        Lihat Progres Saya
      </button>
    )
  else if (closed)
    cta = (
      <button className="btn btn-ghost grow" disabled>
        Quest sudah ditutup
      </button>
    )
  else if (full)
    cta = (
      <button className="btn btn-ghost grow" disabled>
        Slot Penuh
      </button>
    )
  else
    cta = (
      <button className="btn btn-primary grow" onClick={() => setSheet(true)}>
        Ambil Quest
      </button>
    )

  return (
    <Screen
      className="pb-cta"
      footer={
        <div className="cta-bar">
          <div style={{ minWidth: 0 }}>
            <div className="xs muted bold">Bayaran</div>
            <div className="price" style={{ fontSize: 18 }}>
              {rupiah(quest.budget)}
            </div>
          </div>
          {cta}
        </div>
      }
    >
      <div style={{ background: `linear-gradient(180deg, ${k.color}2e, ${k.color}0a)`, paddingBottom: 56 }}>
        <TopBar
          title=""
          variant="clear"
          right={
            <>
              <button
                className="icon-btn solid"
                onClick={() => {
                  setSaved(!saved)
                  showToast(saved ? 'Dihapus dari simpanan' : 'Quest disimpan', 'info')
                }}
                aria-label="Simpan"
              >
                <Bookmark size={19} fill={saved ? 'var(--primary)' : 'none'} color={saved ? 'var(--primary)' : 'currentColor'} />
              </button>
              <button className="icon-btn solid" onClick={() => showToast('Tautan quest disalin', 'info')} aria-label="Bagikan">
                <Share2 size={19} />
              </button>
            </>
          }
        />
        <div className="center" style={{ fontSize: 68, paddingTop: 64 }}>
          <span className="anim-pop" style={{ display: 'inline-block' }}>
            {k.emoji}
          </span>
        </div>
      </div>

      <div className="pad" style={{ marginTop: -40 }}>
        <div className="card" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="row">
            <Avatar name={brand.name} color={brand.color} size={38} square />
            <div className="grow">
              <div className="bold small row gap4">
                {brand.name} {brand.verified && <BadgeCheck size={15} color="var(--info)" />}
              </div>
              <div className="xs muted row gap4">
                <Star size={11} fill="var(--accent)" color="var(--accent)" /> {brand.rating} · {brand.industry}
              </div>
            </div>
          </div>
          <h1 className="h2 mt12" style={{ lineHeight: 1.3 }}>
            {quest.title}
          </h1>
          <div className="row wrap mt12" style={{ gap: 6 }}>
            <span className="badge primary">
              {k.emoji} {k.label}
            </span>
            {mine && <span className="badge success">✓ Sudah kamu ambil</span>}
            {closed && <span className="badge neutral">Ditutup</span>}
          </div>
        </div>

        <div className="info-grid mt12">
          <div className="info-tile">
            <div className="k">
              <Wallet size={13} /> Bayaran / pekerja
            </div>
            <div className="v text-primary">{rupiah(quest.budget)}</div>
          </div>
          <div className="info-tile">
            <div className="k">
              <Users size={13} /> Total slot
            </div>
            <div className="v">{quest.slots} pekerja</div>
          </div>
          <div className="info-tile">
            <div className="k">
              <MapPin size={13} /> Lokasi
            </div>
            <div className="v ellipsis" style={{ fontSize: 13.5 }}>
              {quest.location}
            </div>
          </div>
          <div className="info-tile">
            <div className="k">
              <CalendarDays size={13} /> Periode
            </div>
            <div className="v" style={{ fontSize: 13.5 }}>
              {tanggalPendek(quest.startDate)} – {tanggalPendek(quest.endDate)}
            </div>
          </div>
        </div>

        <div className="card mt12">
          <SlotInfo quest={quest} compact />
          {people.length > 0 && (
            <div className="row mt12">
              <div className="avatars">
                {people.slice(0, 5).map((w) => (
                  <Avatar key={w.id} name={w.name} color={w.color} size={28} />
                ))}
              </div>
              <span className="xs muted bold">
                {people.length > 1 ? `${people[0].name.split(' ')[0]} dan ${f - 1} lainnya sudah bergabung` : `${people[0].name.split(' ')[0]} sudah bergabung`}
              </span>
            </div>
          )}
        </div>

        <div className="section-head">
          <h2>Deskripsi</h2>
        </div>
        <p className="ink2" style={{ fontSize: 14, lineHeight: 1.65 }}>
          {quest.description}
        </p>

        <div className="section-head">
          <h2>Tugas yang Harus Diselesaikan</h2>
        </div>
        <div className="card">
          {quest.objectives.map((o, i) => (
            <div key={i} className="bullet">
              <span className="b" style={{ background: 'var(--primary-50)', color: 'var(--primary)', fontSize: 11, fontWeight: 800 }}>
                {i + 1}
              </span>
              {o}
            </div>
          ))}
        </div>

        <div className="section-head">
          <h2>Persyaratan</h2>
        </div>
        <div className="card">
          {quest.requirements.map((r, i) => (
            <div key={i} className="bullet">
              <span className="b" style={{ background: 'var(--success-50)', color: 'var(--success)' }}>
                <Check size={13} strokeWidth={3} />
              </span>
              {r}
            </div>
          ))}
        </div>

        <div className="section-head">
          <h2>Timeline</h2>
        </div>
        <div className="card">
          <div className="timeline">
            {timeline.map((s, i) => (
              <div key={i} className={`tl-item ${s.done ? 'done' : ''} ${s.now ? 'now' : ''}`}>
                <div className="t">{s.t}</div>
                <div className="d">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-head">
          <h2>Tentang Brand</h2>
        </div>
        <div className="card">
          <div className="row">
            <Avatar name={brand.name} color={brand.color} size={46} square />
            <div className="grow">
              <div className="bold row gap4">
                {brand.name} {brand.verified && <BadgeCheck size={15} color="var(--info)" />}
              </div>
              <div className="xs muted">
                {brand.city} · {brand.totalQuests} quest dibuka
              </div>
            </div>
          </div>
          <p className="small ink2 mt12" style={{ lineHeight: 1.55 }}>
            {brand.bio}
          </p>
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Ambil quest ini?" subtitle="Pastikan kamu bisa menyelesaikannya tepat waktu.">
        <div className="card flat row" style={{ background: 'var(--bg)' }}>
          <div className="qcover" style={{ background: k.color + '1f', width: 44, height: 44, fontSize: 22 }}>
            {k.emoji}
          </div>
          <div className="grow">
            <div className="bold small clamp2">{quest.title}</div>
            <div className="xs muted mt4">
              Tenggat {tanggal(quest.endDate)} · {quest.objectives.length} tugas
            </div>
          </div>
        </div>
        <div className="row between mt16">
          <span className="small muted bold">Bayaran yang kamu terima</span>
          <span className="h3 text-success">{rupiah(quest.budget)}</span>
        </div>
        <div className="divider" />
        {['Saya memenuhi semua persyaratan quest ini', 'Saya setuju dengan Syarat & Ketentuan Garapin'].map((t, i) => (
          <button key={i} className="check-item" style={{ padding: '8px 0', border: 0 }} onClick={() => setAgree(agree.map((v, j) => (j === i ? !v : v)))}>
            <span className={`checkbox ${agree[i] ? 'on' : ''}`}>{agree[i] && <Check size={15} strokeWidth={3} />}</span>
            <span className="txt" style={{ fontSize: 13.5 }}>
              {t}
            </span>
          </button>
        ))}
        <button className="btn btn-primary block mt16" disabled={!agree.every(Boolean)} onClick={take}>
          <CheckCircle2 size={18} /> Ya, Ambil Quest
        </button>
      </Sheet>
    </Screen>
  )
}
