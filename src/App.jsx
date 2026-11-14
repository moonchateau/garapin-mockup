import { Navigate, Route, Routes } from 'react-router-dom'
import { BrandTabs, PekerjaTabs, PhoneFrame } from './components/Layout'
import { useStore } from './store/AppStore'

import Splash from './screens/auth/Splash'
import Onboarding from './screens/auth/Onboarding'
import PilihPeran from './screens/auth/PilihPeran'
import Masuk from './screens/auth/Masuk'

import PBeranda from './screens/pekerja/Beranda'
import PJelajah from './screens/pekerja/Jelajah'
import PDetailQuest from './screens/pekerja/DetailQuest'
import PQuestSaya from './screens/pekerja/QuestSaya'
import PKerjakan from './screens/pekerja/Kerjakan'
import PDompet from './screens/pekerja/Dompet'
import PTarik from './screens/pekerja/TarikSaldo'
import PTarget from './screens/pekerja/Target'
import PProfil from './screens/pekerja/Profil'
import PUlasan from './screens/pekerja/Ulasan'

import BBeranda from './screens/brand/Beranda'
import BQuestSaya from './screens/brand/QuestSaya'
import BBuatQuest from './screens/brand/BuatQuest'
import BKelola from './screens/brand/KelolaQuest'
import BTinjau from './screens/brand/TinjauPekerja'
import BDompet from './screens/brand/Dompet'
import BTopUp from './screens/brand/TopUp'
import BProfil from './screens/brand/Profil'

import Notifikasi from './screens/shared/Notifikasi'
import Sukses from './screens/shared/Sukses'

function Guard({ role, children }) {
  const { state } = useStore()
  if (!state.auth.loggedIn) return <Navigate to="/peran" replace />
  if (state.auth.role !== role) return <Navigate to={state.auth.role === 'brand' ? '/b/beranda' : '/p/beranda'} replace />
  return children
}

const P = (el) => <Guard role="pekerja">{el}</Guard>
const B = (el) => <Guard role="brand">{el}</Guard>

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/peran" element={<PilihPeran />} />
        <Route path="/masuk/:role" element={<Masuk />} />
        <Route path="/sukses" element={<Sukses />} />

        {/* ---------- Pekerja ---------- */}
        <Route path="/p" element={P(<PekerjaTabs />)}>
          <Route index element={<Navigate to="beranda" replace />} />
          <Route path="beranda" element={<PBeranda />} />
          <Route path="jelajah" element={<PJelajah />} />
          <Route path="quest" element={<PQuestSaya />} />
          <Route path="dompet" element={<PDompet />} />
          <Route path="profil" element={<PProfil />} />
        </Route>
        <Route path="/p/quest/:id" element={P(<PDetailQuest />)} />
        <Route path="/p/kerja/:pid" element={P(<PKerjakan />)} />
        <Route path="/p/tarik" element={P(<PTarik />)} />
        <Route path="/p/target" element={P(<PTarget />)} />
        <Route path="/p/ulasan" element={P(<PUlasan />)} />
        <Route path="/p/notifikasi" element={P(<Notifikasi role="pekerja" />)} />

        {/* ---------- Brand ---------- */}
        <Route path="/b" element={B(<BrandTabs />)}>
          <Route index element={<Navigate to="beranda" replace />} />
          <Route path="beranda" element={<BBeranda />} />
          <Route path="quest" element={<BQuestSaya />} />
          <Route path="dompet" element={<BDompet />} />
          <Route path="profil" element={<BProfil />} />
        </Route>
        <Route path="/b/buat" element={B(<BBuatQuest />)} />
        <Route path="/b/buat/:id" element={B(<BBuatQuest />)} />
        <Route path="/b/quest/:id" element={B(<BKelola />)} />
        <Route path="/b/tinjau/:pid" element={B(<BTinjau />)} />
        <Route path="/b/topup" element={B(<BTopUp />)} />
        <Route path="/b/notifikasi" element={B(<Notifikasi role="brand" />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneFrame>
  )
}
