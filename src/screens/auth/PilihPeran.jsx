import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const ROLES = [
  {
    id: 'pekerja',
    emoji: '👷',
    color: '#efeaff',
    title: 'Saya Pekerja',
    text: 'Cari & kerjakan quest dari brand, dapatkan penghasilan tambahan, dan capai target keuanganmu.',
  },
  {
    id: 'brand',
    emoji: '🏢',
    color: '#fff3da',
    title: 'Saya Brand',
    text: 'Buka quest untuk kebutuhan bisnismu dan temukan pekerja terbaik dengan cepat.',
  },
]

export default function PilihPeran() {
  const [role, setRole] = useState('pekerja')
  const nav = useNavigate()
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <div className="pad" style={{ paddingTop: 36, flex: 1 }}>
        <div className="logo-mark" style={{ width: 56, height: 56, fontSize: 26, borderRadius: 18, background: 'var(--primary)', color: '#fff' }}>
          G
        </div>
        <h1 className="h1 mt24">Halo! 👋</h1>
        <p className="ink2 mt8" style={{ lineHeight: 1.55 }}>
          Kamu mau bergabung di Garapin sebagai apa? Peran ini bisa diganti nanti dari menu profil.
        </p>
        <div className="stack mt24">
          {ROLES.map((r) => (
            <button key={r.id} className={`role-card ${role === r.id ? 'active' : ''}`} onClick={() => setRole(r.id)}>
              <span className="em" style={{ background: r.color }}>
                {r.emoji}
              </span>
              <span className="grow">
                <span className="h3" style={{ display: 'block' }}>
                  {r.title}
                </span>
                <span className="small ink2" style={{ display: 'block', marginTop: 4, lineHeight: 1.45 }}>
                  {r.text}
                </span>
              </span>
              <span className={`radio ${role === r.id ? 'on' : ''}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="pad" style={{ paddingBottom: 28 }}>
        <button className="btn btn-primary block" onClick={() => nav(`/masuk/${role}`)}>
          Lanjutkan <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
