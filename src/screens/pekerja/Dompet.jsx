import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Clock, TrendingUp, Trophy } from 'lucide-react'
import { ME_WORKER } from '../../data/mock'
import { useStore, useWorkerFinance } from '../../store/AppStore'
import { rupiah, rupiahSingkat, tanggal } from '../../utils/format'
import { Empty, ProgressBar } from '../../components/ui'

export function TxRow({ tx }) {
  const isIn = tx.type === 'in' || tx.amount > 0
  return (
    <div className="list-item">
      <span className="list-ic" style={{ background: isIn ? 'var(--success-50)' : 'var(--danger-50)', color: isIn ? 'var(--success)' : 'var(--danger)' }}>
        {isIn ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
      </span>
      <div className="grow">
        <div className="bold small ellipsis">{tx.label}</div>
        <div className="xs muted mt4">
          {tx.sub ? tx.sub + ' · ' : ''}
          {tanggal(tx.date)}
        </div>
      </div>
      <span className={`bold small ${isIn ? 'text-success' : ''}`} style={{ whiteSpace: 'nowrap' }}>
        {isIn ? '+' : '−'}
        {rupiah(Math.abs(tx.amount))}
      </span>
    </div>
  )
}

export default function Dompet() {
  const nav = useNavigate()
  const { state } = useStore()
  const fin = useWorkerFinance()
  const [filter, setFilter] = useState('semua')
  const t = state.target
  const done = state.participations.filter((p) => p.workerId === ME_WORKER && p.status === 'selesai').length
  const tx = fin.tx.filter((x) => filter === 'semua' || x.type === filter)

  return (
    <div className="pad pb-nav">
      <div style={{ padding: '14px 0 14px' }}>
        <h1 className="h1">Dompet</h1>
      </div>

      <div className="hero">
        <div className="small muted-w bold">Saldo tersedia</div>
        <div className="xbold mt4" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>
          {rupiah(fin.balance)}
        </div>
        <div className="row mt16" style={{ gap: 8 }}>
          <button className="btn sm btn-white grow" onClick={() => nav('/p/tarik')}>
            <ArrowUpRight size={16} /> Tarik Saldo
          </button>
          <button className="btn sm grow" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }} onClick={() => nav('/p/target')}>
            🎯 Target
          </button>
        </div>
      </div>

      <div className="stat-grid mt16">
        <div className="stat">
          <div className="ic" style={{ background: 'var(--success-50)', color: 'var(--success)' }}>
            <TrendingUp size={16} />
          </div>
          <div className="v" style={{ fontSize: 15 }}>
            {rupiahSingkat(fin.totalIn)}
          </div>
          <div className="k">Total pendapatan</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: 'var(--warning-50)', color: 'var(--warning)' }}>
            <Clock size={16} />
          </div>
          <div className="v" style={{ fontSize: 15 }}>
            {rupiahSingkat(fin.pending)}
          </div>
          <div className="k">Menunggu cair</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
            <Trophy size={16} />
          </div>
          <div className="v" style={{ fontSize: 15 }}>
            {done}
          </div>
          <div className="k">Quest selesai</div>
        </div>
      </div>

      {t && (
        <button className="card tap mt12" onClick={() => nav('/p/target')}>
          <div className="row">
            <span style={{ fontSize: 26 }}>{t.emoji}</span>
            <div className="grow">
              <div className="row between">
                <span className="bold small">{t.name}</span>
                <span className="xs bold text-primary">{Math.min(100, Math.round((fin.targetSaved / t.amount) * 100))}%</span>
              </div>
              <div className="mt8">
                <ProgressBar value={fin.targetSaved} max={t.amount} variant="accent" thin />
              </div>
            </div>
            <ChevronRight size={18} color="var(--muted)" />
          </div>
        </button>
      )}

      <div className="section-head">
        <h2>Riwayat Transaksi</h2>
      </div>
      <div className="chips mb12">
        {[
          ['semua', 'Semua'],
          ['in', 'Pemasukan'],
          ['out', 'Penarikan'],
        ].map(([id, l]) => (
          <button key={id} className={`chip ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
            {l}
          </button>
        ))}
      </div>
      <div className="menu-group">
        {tx.length === 0 ? <Empty emoji="🧾" title="Belum ada transaksi" /> : tx.map((x) => <TxRow key={x.id} tx={x} />)}
      </div>
    </div>
  )
}
