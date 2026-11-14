import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Bell, Building2, CreditCard, FileText, HelpCircle, LogOut, MapPin, RefreshCw, Repeat, Star, Users } from 'lucide-react'
import { BRANDS, ME_BRAND } from '../../data/mock'
import { useStore } from '../../store/AppStore'
import { Avatar } from '../../components/ui'
import { MenuItem } from '../pekerja/Profil'

export default function BrandProfil() {
  const nav = useNavigate()
  const { state, dispatch, showToast } = useStore()
  const brand = BRANDS[ME_BRAND]
  const mine = state.quests.filter((q) => q.brandId === ME_BRAND)
  const hired = new Set(state.participations.filter((p) => mine.some((q) => q.id === p.questId)).map((p) => p.workerId)).size
  const soon = () => showToast('Fitur ini segera hadir', 'info')

  return (
    <div className="pb-nav">
      <div style={{ background: `linear-gradient(160deg, ${brand.color}, #7c2d12)`, padding: '18px 16px 70px', color: '#fff' }}>
        <h1 className="h2">Profil Brand</h1>
      </div>
      <div className="pad" style={{ marginTop: -56 }}>
        <div className="card center" style={{ boxShadow: 'var(--shadow)' }}>
          <div style={{ marginTop: -50, display: 'inline-block', borderRadius: 26, border: '4px solid #fff' }}>
            <Avatar name={brand.name} color={brand.color} size={80} square />
          </div>
          <h2 className="h2 mt8 row" style={{ justifyContent: 'center', gap: 6 }}>
            {brand.name} <BadgeCheck size={20} color="var(--info)" />
          </h2>
          <div className="small muted bold mt4">{brand.industry}</div>
          <div className="xs muted bold row mt4" style={{ justifyContent: 'center', gap: 4 }}>
            <MapPin size={12} /> {brand.city}
          </div>
          <p className="small ink2 mt12" style={{ lineHeight: 1.55 }}>
            {brand.bio}
          </p>
          <div className="divider" />
          <div className="row" style={{ justifyContent: 'space-around' }}>
            <div>
              <div className="h2">{brand.totalQuests + mine.length - 5}</div>
              <div className="xs muted bold">Quest dibuat</div>
            </div>
            <div>
              <div className="h2">{hired + 46}</div>
              <div className="xs muted bold">Pekerja direkrut</div>
            </div>
            <div>
              <div className="h2 row gap4" style={{ justifyContent: 'center' }}>
                <Star size={17} fill="var(--accent)" color="var(--accent)" /> {brand.rating}
              </div>
              <div className="xs muted bold">Rating brand</div>
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Akun Brand</h2>
        </div>
        <div className="menu-group">
          <MenuItem icon={Building2} label="Informasi Brand" sub="Logo, deskripsi, alamat" onClick={soon} />
          <MenuItem icon={Users} label="Anggota Tim" sub="3 anggota" onClick={soon} />
          <MenuItem icon={CreditCard} label="Metode Pembayaran" onClick={() => nav('/b/topup')} />
          <MenuItem icon={FileText} label="Faktur & Pajak" onClick={soon} />
          <MenuItem icon={Bell} label="Notifikasi" onClick={() => nav('/b/notifikasi')} />
          <MenuItem icon={HelpCircle} label="Pusat Bantuan" onClick={soon} />
        </div>

        <div className="section-head">
          <h2>Mode Demo</h2>
        </div>
        <div className="menu-group">
          <MenuItem
            icon={Repeat}
            label="Ganti ke Mode Pekerja"
            sub="Lihat aplikasi dari sisi pekerja"
            bg="var(--primary-50)"
            color="var(--primary)"
            onClick={() => {
              dispatch({ type: 'SWITCH_ROLE', role: 'pekerja' })
              nav('/p/beranda')
            }}
          />
          <MenuItem
            icon={RefreshCw}
            label="Reset Data Demo"
            sub="Kembalikan semua data ke awal"
            onClick={() => {
              dispatch({ type: 'RESET' })
              showToast('Data demo sudah direset')
            }}
          />
          <MenuItem
            icon={LogOut}
            label="Keluar"
            danger
            onClick={() => {
              dispatch({ type: 'LOGOUT' })
              nav('/peran', { replace: true })
            }}
          />
        </div>
        <p className="xs muted center mt20">Garapin untuk Brand v0.1 · Mockup</p>
      </div>
    </div>
  )
}
