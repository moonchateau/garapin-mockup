import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/AppStore'
import { useStatusBar } from '../../components/ui'

export default function Splash() {
  const { state } = useStore()
  const nav = useNavigate()
  useStatusBar('#5B3DF5', '#fff')

  useEffect(() => {
    const t = setTimeout(() => {
      const { loggedIn, role, onboarded } = state.auth
      if (loggedIn) nav(role === 'brand' ? '/b/beranda' : '/p/beranda', { replace: true })
      else nav(onboarded ? '/peran' : '/onboarding', { replace: true })
    }, 1400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="splash">
      <div className="logo-mark anim-pop">G</div>
      <h1 className="h1 mt20 anim-rise" style={{ fontSize: 32, animationDelay: '.15s' }}>
        Garapin
      </h1>
      <p className="anim-rise" style={{ opacity: 0.8, marginTop: 6, animationDelay: '.3s' }}>
        Ambil quest, selesaikan, dapat cuan.
      </p>
    </div>
  )
}
