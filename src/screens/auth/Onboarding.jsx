import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../../store/AppStore'

const SLIDES = [
  {
    emoji: '🧭',
    bg: 'linear-gradient(150deg,#efeaff,#dcd3ff)',
    title: 'Temukan quest seru dari brand lokal',
    text: 'Bikin konten, survei lapangan, jaga event, sampai mystery shopper — pilih yang paling cocok denganmu.',
    floaters: [
      { t: '🎬 Konten Kreator', s: { top: 40, left: 24 } },
      { t: 'Sisa 2 slot!', s: { bottom: 50, right: 22, color: 'var(--danger)' } },
    ],
  },
  {
    emoji: '💸',
    bg: 'linear-gradient(150deg,#e3f8ee,#c6f0dc)',
    title: 'Kerjakan, kirim bukti, langsung dibayar',
    text: 'Selesaikan setiap misi, unggah hasil kerjamu, dan bayaran masuk ke dompet setelah disetujui brand.',
    floaters: [
      { t: '+Rp150.000', s: { top: 44, right: 26, color: 'var(--success)' } },
      { t: '⭐ 5.0 dari Kopi Senja', s: { bottom: 46, left: 22 } },
    ],
  },
  {
    emoji: '🎯',
    bg: 'linear-gradient(150deg,#fff3da,#ffe2a8)',
    title: 'Wujudkan target keuanganmu',
    text: 'Pasang target tabungan, pantau progresnya, dan lihat berapa quest lagi yang perlu kamu selesaikan.',
    floaters: [
      { t: '💻 Laptop Baru · 64%', s: { top: 42, left: 22 } },
      { t: '≈ 6 quest lagi', s: { bottom: 50, right: 24, color: 'var(--primary)' } },
    ],
  },
]

export default function Onboarding() {
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const { dispatch } = useStore()
  const s = SLIDES[i]
  const finish = () => {
    dispatch({ type: 'ONBOARDED' })
    nav('/peran')
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <div className="row between pad" style={{ height: 52 }}>
        <span className="bold text-primary">Garapin</span>
        {i < SLIDES.length - 1 && (
          <button className="small bold muted" onClick={finish}>
            Lewati
          </button>
        )}
      </div>
      <div className="onb-art" style={{ background: s.bg }} key={i}>
        <span className="big anim-pop">{s.emoji}</span>
        {s.floaters.map((f, k) => (
          <span key={k} className="floater anim-rise" style={{ ...f.s, animationDelay: 0.15 + k * 0.15 + 's' }}>
            {f.t}
          </span>
        ))}
      </div>
      <div className="pad center" style={{ flex: 1, paddingTop: 28 }}>
        <div className="dots mb16">
          {SLIDES.map((_, k) => (
            <i key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
        <h1 className="h1 anim-rise" key={'t' + i} style={{ fontSize: 25, lineHeight: 1.25 }}>
          {s.title}
        </h1>
        <p className="ink2 mt12 anim-rise" key={'p' + i} style={{ lineHeight: 1.6, fontSize: 14.5 }}>
          {s.text}
        </p>
      </div>
      <div className="pad" style={{ paddingBottom: 28 }}>
        <button className="btn btn-primary block" onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : finish())}>
          {i < SLIDES.length - 1 ? 'Lanjut' : 'Mulai Sekarang'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
