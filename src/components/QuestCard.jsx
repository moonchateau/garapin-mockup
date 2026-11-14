import { useNavigate } from 'react-router-dom'
import { BadgeCheck, CalendarDays, MapPin, Users } from 'lucide-react'
import { BRANDS, kategoriById } from '../data/mock'
import { useQuestHelpers } from '../store/AppStore'
import { labelSisaHari, rupiah } from '../utils/format'
import { ProgressBar, StatusBadge } from './ui'

export function QuestCover({ quest, size = 52 }) {
  const k = kategoriById(quest.category)
  return (
    <div className="qcover" style={{ background: k.color + '1f', width: size, height: size, fontSize: size * 0.5 }}>
      {k.emoji}
    </div>
  )
}

export function SlotInfo({ quest, compact }) {
  const { filled } = useQuestHelpers()
  const f = Math.min(filled(quest), quest.slots)
  const left = quest.slots - f
  return (
    <div className={compact ? '' : 'mt12'}>
      <div className="row between xs mb8" style={{ marginBottom: 6 }}>
        <span className="muted bold row gap4">
          <Users size={13} /> {f}/{quest.slots} slot terisi
        </span>
        <span className={`bold ${left <= 2 && left > 0 ? 'text-danger' : left === 0 ? 'muted' : 'text-success'}`}>
          {left === 0 ? 'Penuh' : left <= 2 ? `Sisa ${left} slot!` : `${left} slot tersedia`}
        </span>
      </div>
      <ProgressBar value={f} max={quest.slots} variant={left <= 2 ? 'accent' : ''} thin />
    </div>
  )
}

export default function QuestCard({ quest, to, status, showSlots = true, right }) {
  const nav = useNavigate()
  const brand = BRANDS[quest.brandId]
  return (
    <button className="card tap qcard" onClick={() => nav(to || `/p/quest/${quest.id}`)}>
      <div className="row top">
        <QuestCover quest={quest} />
        <div className="grow">
          <div className="row between gap6">
            <span className="xs muted bold row gap4 ellipsis">
              {brand.name}
              {brand.verified && <BadgeCheck size={13} color="var(--info)" />}
            </span>
            {status ? <StatusBadge status={status} /> : right}
          </div>
          <div className="title clamp2 mt4">{quest.title}</div>
        </div>
      </div>
      <div className="qmeta">
        <span className="tag">
          <MapPin size={13} /> {quest.location}
        </span>
        <span className="tag">
          <CalendarDays size={13} /> {labelSisaHari(quest.endDate)}
        </span>
      </div>
      <div className="row between mt12">
        <span className="price">
          {rupiah(quest.budget)} <small>/ pekerja</small>
        </span>
      </div>
      {showSlots && <SlotInfo quest={quest} />}
    </button>
  )
}
