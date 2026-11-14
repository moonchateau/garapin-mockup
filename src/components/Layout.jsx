import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Briefcase, Compass, Home, LayoutGrid, Plus, User, Wallet } from 'lucide-react'
import { ME_BRAND, ME_WORKER } from '../data/mock'
import { useStore } from '../store/AppStore'
import { Toast } from './ui'

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="notch" />
      <span className="icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .8C5.3.8 2.8 1.8.9 3.7L2 4.9a8.5 8.5 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.1-1.2A7 7 0 0 0 8 4.2a7 7 0 0 0-4.7 1.9l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c-.6 0-1.2.2-1.6.6L8 11.5l1.6-1.7c-.4-.4-1-.6-1.6-.6Z" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x=".5" y=".5" width="22" height="11" rx="3.5" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
          <rect x="24" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".5" />
        </svg>
      </span>
    </div>
  )
}

function DemoPanel() {
  const { state, dispatch, showToast } = useStore()
  const nav = useNavigate()
  const role = state.auth.loggedIn ? state.auth.role : null
  const switchTo = (r) => {
    dispatch({ type: 'SWITCH_ROLE', role: r })
    nav(r === 'brand' ? '/b/beranda' : '/p/beranda')
  }
  return (
    <aside className="demo-panel">
      <h3>🧭 Panel Demo</h3>
      <p>
        Mockup aplikasi <b>Garapin</b>. Semua data hanya simulasi dan tersimpan di browser ini.
      </p>
      <div className="seg tabs">
        <button className={`tab ${role === 'pekerja' ? 'active' : ''}`} onClick={() => switchTo('pekerja')}>
          👷 Pekerja
        </button>
        <button className={`tab ${role === 'brand' ? 'active' : ''}`} onClick={() => switchTo('brand')}>
          🏢 Brand
        </button>
      </div>
      <b style={{ color: 'var(--ink)' }}>Coba alur lengkapnya:</b>
      <ol>
        <li>
          <b>Brand</b> → tombol <b>+</b> → buat & terbitkan quest
        </li>
        <li>
          <b>Pekerja</b> → Jelajah → ambil quest tersebut
        </li>
        <li>
          <b>Pekerja</b> → Quest Saya → centang tugas → kirim hasil
        </li>
        <li>
          <b>Brand</b> → Quest → tinjau → setujui, bayar & beri ulasan
        </li>
        <li>
          <b>Pekerja</b> → Dompet & Target → saldo bertambah
        </li>
      </ol>
      <div className="row mt16">
        <button
          className="btn sm btn-ghost"
          onClick={() => {
            dispatch({ type: 'RESTART' })
            nav('/')
          }}
        >
          ⟲ Ke awal
        </button>
        <button
          className="btn sm btn-danger-soft"
          onClick={() => {
            dispatch({ type: 'RESET' })
            showToast('Data demo sudah direset')
          }}
        >
          Reset data
        </button>
      </div>
    </aside>
  )
}

export function PhoneFrame({ children }) {
  return (
    <div className="stage">
      <DemoPanel />
      <div className="phone">
        <StatusBar />
        {children}
        <Toast />
      </div>
    </div>
  )
}

function ScrollArea({ children }) {
  const ref = useRef()
  const { pathname } = useLocation()
  useEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, [pathname])
  return (
    <main className="screen" ref={ref}>
      {children}
    </main>
  )
}

/** Layar tanpa navigasi bawah (detail, formulir, dsb.) */
export function Screen({ children, className = '', footer }) {
  return (
    <>
      <ScrollArea>
        <div className={className}>{children}</div>
      </ScrollArea>
      {footer}
    </>
  )
}

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink to={to} className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}>
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.4 : 1.9} />
          {label}
          {badge > 0 && <span className="badge">{badge}</span>}
        </>
      )}
    </NavLink>
  )
}

export function PekerjaTabs() {
  const { state } = useStore()
  const active = state.participations.filter((p) => p.workerId === ME_WORKER && ['berjalan', 'revisi'].includes(p.status)).length
  return (
    <>
      <ScrollArea>
        <Outlet />
      </ScrollArea>
      <nav className="bottomnav">
        <NavItem to="/p/beranda" icon={Home} label="Beranda" />
        <NavItem to="/p/jelajah" icon={Compass} label="Jelajah" />
        <NavItem to="/p/quest" icon={Briefcase} label="Quest Saya" badge={active} />
        <NavItem to="/p/dompet" icon={Wallet} label="Dompet" />
        <NavItem to="/p/profil" icon={User} label="Profil" />
      </nav>
    </>
  )
}

export function BrandTabs() {
  const { state } = useStore()
  const nav = useNavigate()
  const pending = state.participations.filter(
    (p) => p.status === 'ditinjau' && state.quests.find((q) => q.id === p.questId)?.brandId === ME_BRAND,
  ).length
  return (
    <>
      <ScrollArea>
        <Outlet />
      </ScrollArea>
      <nav className="bottomnav">
        <NavItem to="/b/beranda" icon={Home} label="Beranda" />
        <NavItem to="/b/quest" icon={LayoutGrid} label="Quest" badge={pending} />
        <div className="navitem">
          <button className="nav-fab" onClick={() => nav('/b/buat')} aria-label="Buat Quest">
            <Plus size={26} strokeWidth={2.6} />
          </button>
        </div>
        <NavItem to="/b/dompet" icon={Wallet} label="Dompet" />
        <NavItem to="/b/profil" icon={User} label="Profil" />
      </nav>
    </>
  )
}
