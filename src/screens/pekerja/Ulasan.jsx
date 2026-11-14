import { Star } from 'lucide-react'
import { Screen } from '../../components/Layout'
import { Empty, ProgressBar, Stars, TopBar } from '../../components/ui'
import { ReviewCard, useMyReviews } from './Profil'

export default function Ulasan() {
  const reviews = useMyReviews()
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }))

  return (
    <Screen className="pb-nav">
      <TopBar title="Ulasan Saya" />
      <div className="pad">
        {reviews.length === 0 ? (
          <Empty emoji="⭐" title="Belum ada ulasan" text="Selesaikan quest untuk mendapatkan ulasan dari brand." />
        ) : (
          <>
            <div className="card row" style={{ gap: 20 }}>
              <div className="center" style={{ minWidth: 90 }}>
                <div className="h1" style={{ fontSize: 40 }}>
                  {avg.toFixed(1)}
                </div>
                <Stars value={avg} size={14} />
                <div className="xs muted bold mt4">{reviews.length} ulasan</div>
              </div>
              <div className="grow">
                {dist.map((d) => (
                  <div key={d.n} className="row" style={{ gap: 8, marginBottom: 4 }}>
                    <span className="xs bold row gap4" style={{ width: 24 }}>
                      {d.n} <Star size={10} fill="var(--accent)" color="var(--accent)" />
                    </span>
                    <div className="grow">
                      <ProgressBar value={d.c} max={reviews.length} variant="accent" thin />
                    </div>
                    <span className="xs muted bold" style={{ width: 14, textAlign: 'right' }}>
                      {d.c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="stack mt16">
              {reviews.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
