import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { ME_BRAND, WORKERS } from '../../data/mock'
import { useBrandFinance, useStore } from '../../store/AppStore'
import { rupiah, rupiahSingkat, tanggal } from '../../utils/format'
import { Avatar, Empty } from '../../components/ui'
import { TxRow } from '../pekerja/Dompet'

export default function BrandDompet() {
  const nav = useNavigate()
  const { state, showToast } = useStore()
  const fin = useBrandFinance()
  const [tab, setTab] = useState('saldo')

  const payouts = state.participations
    .filter((p) => p.status === 'selesai' && state.quests.find((q) => q.id === p.questId)?.brandId === ME_BRAND)
    .map((p) => ({ ...p, quest: state.quests.find((q) => q.id === p.questId), worker: WORKERS[p.workerId] }))
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))

  return (
    <div className="pad pb-nav">
      <div className="row between" style={{ padding: '14px 0 14px' }}>
        <h1 className="h1">Dompet Brand</h1>
        <button className="icon-btn solid" onClick={() => showToast('Laporan keuangan diunduh (simulasi)', 'info')} aria-label="Unduh laporan">
          <FileText size={19} />
        </button>
      </div>

      <div className="hero">
        <div className="small muted-w bold">Saldo tersedia</div>
        <div className="xbold mt4" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>
          {rupiah(fin.balance)}
        </div>
        <button className="btn sm btn-white mt16" onClick={() => nav('/b/topup')}>
          <Plus size={16} /> Top Up Saldo
        </button>
      </div>

      <div className="info-grid mt16">
        <div className="info-tile">
          <div className="k">🔒 Dana ditahan</div>
          <div className="v">{rupiahSingkat(fin.held)}</div>
          <div className="xs muted mt4">Untuk slot quest aktif</div>
        </div>
        <div className="info-tile">
          <div className="k">✅ Sudah dibayarkan</div>
          <div className="v">{rupiahSingkat(fin.paidOut)}</div>
          <div className="xs muted mt4">{payouts.length} pembayaran</div>
        </div>
      </div>

      <div className="tabs mt20 mb12">
        <button className={`tab ${tab === 'saldo' ? 'active' : ''}`} onClick={() => setTab('saldo')}>
          Mutasi Saldo
        </button>
        <button className={`tab ${tab === 'bayar' ? 'active' : ''}`} onClick={() => setTab('bayar')}>
          Pembayaran Pekerja
        </button>
      </div>

      {tab === 'saldo' ? (
        <div className="menu-group">
          {state.brandTx.map((t) => (
            <TxRow key={t.id} tx={{ ...t, type: t.amount > 0 ? 'in' : 'out', sub: t.type === 'topup' ? 'Top up' : t.type === 'refund' ? 'Pengembalian' : t.type === 'fee' ? 'Biaya layanan' : 'Dana ditahan' }} />
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <Empty emoji="💸" title="Belum ada pembayaran" />
      ) : (
        <div className="menu-group">
          {payouts.map((p) => (
            <div key={p.id} className="list-item">
              <Avatar name={p.worker.name} color={p.worker.color} size={40} />
              <div className="grow">
                <div className="bold small">{p.worker.name}</div>
                <div className="xs muted ellipsis">
                  {p.quest.title} · {tanggal(p.paidAt)}
                </div>
              </div>
              <span className="bold small">{rupiah(p.quest.budget)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
