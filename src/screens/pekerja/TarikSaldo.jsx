import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore, useWorkerFinance } from '../../store/AppStore'
import { angka, rupiah } from '../../utils/format'
import { Screen } from '../../components/Layout'
import { Sheet, TopBar } from '../../components/ui'

const METHODS = [
  { id: 'bca', label: 'BCA', sub: '•••• 4521 · Dimas Pratama', em: '🏦' },
  { id: 'gopay', label: 'GoPay', sub: '0812-••••-7890', em: '💚' },
  { id: 'dana', label: 'DANA', sub: '0812-••••-7890', em: '💙' },
]

export default function TarikSaldo() {
  const nav = useNavigate()
  const { dispatch, showToast } = useStore()
  const { balance } = useWorkerFinance()
  const [amount, setAmount] = useState(Math.min(balance, 500000))
  const [method, setMethod] = useState('bca')
  const [confirm, setConfirm] = useState(false)
  const m = METHODS.find((x) => x.id === method)
  const invalid = amount < 50000 || amount > balance

  const submit = () => {
    dispatch({ type: 'WITHDRAW', amount, bank: `${m.label} ${m.sub.split(' ·')[0]}` })
    nav('/sukses', {
      replace: true,
      state: {
        emoji: '💸',
        title: 'Penarikan diproses!',
        text: `${rupiah(amount)} akan masuk ke ${m.label} kamu dalam beberapa menit.`,
        primary: { label: 'Kembali ke Dompet', to: '/p/dompet' },
      },
    })
  }

  return (
    <Screen
      className="pb-cta"
      footer={
        <div className="cta-bar">
          <button className="btn btn-primary grow" disabled={invalid} onClick={() => setConfirm(true)}>
            Tarik {rupiah(amount)}
          </button>
        </div>
      }
    >
      <TopBar title="Tarik Saldo" />
      <div className="pad">
        <div className="card center">
          <div className="small muted bold">Saldo tersedia</div>
          <div className="h2 mt4">{rupiah(balance)}</div>
        </div>

        <label className="field mt20">
          <span>Jumlah penarikan</span>
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
          <div className={`hint ${amount > balance ? 'text-danger' : ''}`}>
            {amount > balance ? 'Jumlah melebihi saldo tersedia' : 'Minimal penarikan Rp50.000 · Gratis biaya admin'}
          </div>
        </label>
        <div className="chips" style={{ marginTop: -4 }}>
          {[100000, 250000, 500000].map((v) => (
            <button key={v} className={`chip ${amount === v ? 'active' : ''}`} onClick={() => setAmount(v)}>
              {rupiah(v)}
            </button>
          ))}
          <button className={`chip ${amount === balance ? 'active' : ''}`} onClick={() => setAmount(balance)}>
            Semua saldo
          </button>
        </div>

        <div className="small bold mt24 mb8">Tarik ke</div>
        <div className="stack">
          {METHODS.map((x) => (
            <button key={x.id} className={`role-card ${method === x.id ? 'active' : ''}`} style={{ padding: 14, borderRadius: 16 }} onClick={() => setMethod(x.id)}>
              <span style={{ fontSize: 24 }}>{x.em}</span>
              <span className="grow">
                <span className="bold" style={{ display: 'block' }}>
                  {x.label}
                </span>
                <span className="xs muted">{x.sub}</span>
              </span>
              <span className={`radio ${method === x.id ? 'on' : ''}`} />
            </button>
          ))}
          <button className="btn btn-soft block" onClick={() => showToast('Fitur tambah rekening segera hadir', 'info')}>
            <Plus size={17} /> Tambah rekening / e-wallet
          </button>
        </div>
      </div>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Konfirmasi penarikan">
        <div className="card flat mt12" style={{ background: 'var(--bg)' }}>
          {[
            ['Jumlah', rupiah(amount)],
            ['Biaya admin', 'Gratis'],
            ['Tujuan', `${m.label} · ${m.sub.split(' ·')[0]}`],
          ].map(([k, v]) => (
            <div key={k} className="row between small" style={{ padding: '6px 0' }}>
              <span className="muted bold">{k}</span>
              <span className="bold">{v}</span>
            </div>
          ))}
          <div className="divider" style={{ margin: '8px 0' }} />
          <div className="row between">
            <span className="bold">Diterima</span>
            <span className="h3 text-success">{rupiah(amount)}</span>
          </div>
        </div>
        <button className="btn btn-primary block mt16" onClick={submit}>
          Konfirmasi & Tarik
        </button>
      </Sheet>
    </Screen>
  )
}
