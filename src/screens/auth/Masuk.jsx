import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { TopBar } from '../../components/ui'
import { useStore } from '../../store/AppStore'

export default function Masuk() {
  const { role } = useParams()
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState(role === 'brand' ? '811 2233 4455' : '812 3456 7890')
  const [otp, setOtp] = useState('')
  const isBrand = role === 'brand'

  const login = () => {
    dispatch({ type: 'LOGIN', role })
    showToast(isBrand ? 'Selamat datang, Kopi Senja!' : 'Selamat datang, Dimas!')
    nav(isBrand ? '/b/beranda' : '/p/beranda', { replace: true })
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <TopBar title="" variant="surface" onBack={step === 'otp' ? () => setStep('phone') : undefined} backTo={step === 'phone' ? '/peran' : undefined} />
      <div className="pad" style={{ flex: 1, paddingTop: 8 }}>
        <span className={`badge ${isBrand ? 'accent' : 'primary'}`}>{isBrand ? '🏢 Masuk sebagai Brand' : '👷 Masuk sebagai Pekerja'}</span>
        {step === 'phone' ? (
          <>
            <h1 className="h1 mt12">Masuk atau Daftar</h1>
            <p className="ink2 mt8 mb16" style={{ lineHeight: 1.55 }}>
              Masukkan nomor HP kamu. Kami akan mengirimkan kode verifikasi lewat SMS/WhatsApp.
            </p>
            <label className="field">
              <span>Nomor HP</span>
              <div className="input-wrap">
                <span className="prefix" style={{ color: 'var(--ink)' }}>
                  +62
                </span>
                <input className="input with-prefix" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" style={{ paddingLeft: 52 }} />
              </div>
            </label>
            {isBrand && (
              <label className="field">
                <span>Nama Brand / Usaha</span>
                <input className="input" defaultValue="Kopi Senja" />
              </label>
            )}
            <button className="btn btn-primary block mt8" disabled={phone.replace(/\D/g, '').length < 9} onClick={() => setStep('otp')}>
              Kirim Kode
            </button>
            <div className="row mt20" style={{ gap: 12 }}>
              <div className="grow divider" style={{ margin: 0 }} />
              <span className="xs muted bold">atau</span>
              <div className="grow divider" style={{ margin: 0 }} />
            </div>
            <button className="btn btn-ghost block mt20" onClick={login}>
              <span style={{ fontWeight: 800, color: '#4285F4' }}>G</span> Lanjutkan dengan Google
            </button>
          </>
        ) : (
          <>
            <h1 className="h1 mt12">Masukkan Kode</h1>
            <p className="ink2 mt8 mb16" style={{ lineHeight: 1.55 }}>
              Kode 4 digit telah dikirim ke <b>+62 {phone}</b>
            </p>
            <input
              className="input center"
              autoFocus
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ fontSize: 28, letterSpacing: '0.6em', fontWeight: 800, height: 64 }}
            />
            <p className="xs muted center mt8">Demo: masukkan 4 digit angka apa saja</p>
            <button className="btn btn-primary block mt20" disabled={otp.length < 4} onClick={login}>
              Verifikasi & Masuk
            </button>
            <p className="small center mt16 muted">
              Belum terima kode? <b className="text-primary">Kirim ulang (0:42)</b>
            </p>
          </>
        )}
      </div>
      <div className="pad row" style={{ paddingBottom: 26, justifyContent: 'center' }}>
        <ShieldCheck size={15} color="var(--success)" />
        <span className="xs muted">Data kamu aman & terenkripsi</span>
      </div>
    </div>
  )
}
