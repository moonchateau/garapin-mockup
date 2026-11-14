import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { useBrandFinance, useStore } from '../../store/AppStore'
import { angka, rupiah, rupiahSingkat } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Sheet, TopBar } from '../../components/ui'

const METHODS = [
  { id: 'va-bca', label: 'Virtual Account BCA', em: '🏦', group: 'Transfer Bank' },
  { id: 'va-mandiri', label: 'Virtual Account Mandiri', em: '🏦', group: 'Transfer Bank' },
  { id: 'va-bri', label: 'Virtual Account BRI', em: '🏦', group: 'Transfer Bank' },
  { id: 'qris', label: 'QRIS', em: '📱', group: 'Lainnya' },
  { id: 'gopay', label: 'GoPay', em: '💚', group: 'Lainnya' },
]

export default function TopUp() {
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const { balance } = useBrandFinance()
  const [amount, setAmount] = useState(2500000)
  const [method, setMethod] = useState('va-bca')
  const [pay, setPay] = useState(false)
  const m = METHODS.find((x) => x.id === method)

  const done = () => {
    dispatch({ type: 'TOPUP', amount, method: m.label })
    nav('/sukses', {
      replace: true,
      state: {
        emoji: '💰',
        title: 'Top up berhasil!',
        text: `Saldo ${rupiah(amount)} sudah masuk dan siap dipakai untuk membuat quest.`,
        primary: { label: 'Buat Quest Sekarang', to: '/b/buat' },
        secondary: { label: 'Ke Dompet', to: '/b/dompet' },
      },
    })
  }

  return (
    <Screen
      className="pb-cta"
      footer={
        <div className="cta-bar">
          <button className="btn btn-primary grow" disabled={amount < 100000} onClick={() => setPay(true)}>
            Top Up {rupiah(amount)}
          </button>
        </div>
      }
    >
      <TopBar title="Top Up Saldo" />
      <div className="pad">
        <div className="card row between">
          <span className="small muted bold">Saldo saat ini</span>
          <span className="bold">{rupiah(balance)}</span>
        </div>

        <label className="field mt20">
          <span>Nominal top up</span>
          <div className="input-wrap">
            <span className="prefix">Rp</span>
            <input
              className="input with-prefix"
              style={{ fontSize: 22, fontWeight: 800, height: 60 }}
              inputMode="numeric"
              value={amount ? amount.toLocaleString('id-ID') : ''}
              onChange={(e) => setAmount(angka(e.target.value))}
            />
          </div>
          <div className="hint">Minimal top up Rp100.000</div>
        </label>
        <div className="select-grid">
          {[1000000, 2500000, 5000000, 10000000].map((v) => (
            <button key={v} className={`select-tile ${amount === v ? 'active' : ''}`} style={{ justifyContent: 'center', fontWeight: 800 }} onClick={() => setAmount(v)}>
              {rupiahSingkat(v)}
            </button>
          ))}
        </div>

        {['Transfer Bank', 'Lainnya'].map((g) => (
          <div key={g}>
            <div className="small bold mt24 mb8">{g}</div>
            <div className="stack">
              {METHODS.filter((x) => x.group === g).map((x) => (
                <button key={x.id} className={`role-card ${method === x.id ? 'active' : ''}`} style={{ padding: 14, borderRadius: 16 }} onClick={() => setMethod(x.id)}>
                  <span style={{ fontSize: 22 }}>{x.em}</span>
                  <span className="grow bold small">{x.label}</span>
                  <span className={`radio ${method === x.id ? 'on' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={pay} onClose={() => setPay(false)} title="Selesaikan pembayaran" subtitle="Bayar sebelum 23:59 hari ini">
        <div className="card flat center" style={{ background: 'var(--bg)' }}>
          <div className="small muted bold">{m.label}</div>
          {method === 'qris' ? (
            <div
              style={{
                width: 150,
                height: 150,
                margin: '12px auto',
                borderRadius: 12,
                background: 'repeating-conic-gradient(#141629 0 25%, #fff 0 50%) 0 0 / 20px 20px',
                border: '8px solid #fff',
              }}
            />
          ) : (
            <div className="row mt8" style={{ justifyContent: 'center' }}>
              <span className="h2" style={{ letterSpacing: '0.06em' }}>
                8808 1234 5678 9012
              </span>
              <button className="text-primary" onClick={() => showToast('Nomor disalin', 'info')} aria-label="Salin">
                <Copy size={18} />
              </button>
            </div>
          )}
          <div className="divider" />
          <div className="row between">
            <span className="small muted bold">Total bayar</span>
            <span className="h3 text-primary">{rupiah(amount)}</span>
          </div>
        </div>
        <button className="btn btn-primary block mt16" onClick={done}>
          Saya Sudah Bayar
        </button>
        <p className="xs muted center mt8">Demo: pembayaran langsung dianggap berhasil</p>
      </Sheet>
    </Screen>
  )
}
