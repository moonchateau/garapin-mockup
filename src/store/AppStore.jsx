import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  BRANDS,
  ME_BRAND,
  ME_WORKER,
  WORKERS,
  seedBrandTx,
  seedNotifs,
  seedParticipations,
  seedQuests,
  seedTarget,
  seedWithdrawals,
} from '../data/mock'
import { rupiah, uid } from '../utils/format'

const STORAGE_KEY = 'garapin-mockup-v1'

const seed = () => ({
  auth: { loggedIn: false, role: null, onboarded: false },
  quests: seedQuests(),
  participations: seedParticipations(),
  withdrawals: seedWithdrawals(),
  target: seedTarget(),
  brandTx: seedBrandTx(),
  notifs: seedNotifs(),
})

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* abaikan */
  }
  return seed()
}

const now = () => new Date().toISOString()

const notif = (role, icon, title, body, link) => ({ id: uid('n'), role, icon, title, body, link, date: now(), read: false })

function reducer(state, a) {
  const updateP = (id, fn) => state.participations.map((p) => (p.id === id ? fn(p) : p))
  const questOf = (pid) => {
    const p = state.participations.find((x) => x.id === pid)
    return [p, state.quests.find((q) => q.id === p?.questId)]
  }

  switch (a.type) {
    case 'ONBOARDED':
      return { ...state, auth: { ...state.auth, onboarded: true } }
    case 'LOGIN':
      return { ...state, auth: { ...state.auth, loggedIn: true, role: a.role, onboarded: true } }
    case 'SWITCH_ROLE':
      return { ...state, auth: { ...state.auth, loggedIn: true, role: a.role } }
    case 'LOGOUT':
      return { ...state, auth: { ...state.auth, loggedIn: false, role: null } }
    case 'RESTART':
      return { ...state, auth: { loggedIn: false, role: null, onboarded: false } }

    case 'TAKE_QUEST': {
      const quest = state.quests.find((q) => q.id === a.questId)
      const p = {
        id: a.pid || uid('p'),
        questId: a.questId,
        workerId: ME_WORKER,
        status: 'berjalan',
        progress: quest.objectives.map(() => false),
        takenAt: now(),
        note: '',
        files: [],
        revisionNote: '',
        review: null,
        paidAt: null,
      }
      const extra = quest.brandId === ME_BRAND
        ? [notif('brand', 'user', `${WORKERS[ME_WORKER].name} mengambil quest`, quest.title, `/b/quest/${quest.id}`)]
        : []
      return { ...state, participations: [...state.participations, p], notifs: [...extra, ...state.notifs] }
    }
    case 'TOGGLE_OBJECTIVE':
      return {
        ...state,
        participations: updateP(a.pid, (p) => ({ ...p, progress: p.progress.map((v, i) => (i === a.index ? !v : v)) })),
      }
    case 'SUBMIT_WORK': {
      const [p, quest] = questOf(a.pid)
      const w = WORKERS[p.workerId]
      const extra = quest.brandId === ME_BRAND
        ? [notif('brand', 'review', `${w.name} mengirim hasil kerja`, quest.title, `/b/tinjau/${p.id}`)]
        : []
      return {
        ...state,
        participations: updateP(a.pid, (x) => ({ ...x, status: 'ditinjau', note: a.note, files: a.files, submittedAt: now(), revisionNote: '' })),
        notifs: [...extra, ...state.notifs],
      }
    }
    case 'CANCEL_PARTICIPATION':
      return { ...state, participations: state.participations.filter((p) => p.id !== a.pid) }

    case 'APPROVE_WORK': {
      const [p, quest] = questOf(a.pid)
      const extra = p.workerId === ME_WORKER
        ? [
            notif('pekerja', 'money', 'Pembayaran diterima 🎉', `${rupiah(quest.budget)} dari ${BRANDS[quest.brandId].name} sudah masuk ke dompetmu`, '/p/dompet'),
            notif('pekerja', 'star', `Kamu dapat ulasan ${a.rating} bintang`, `"${a.comment || 'Kerja bagus!'}"`, `/p/kerja/${p.id}`),
          ]
        : []
      return {
        ...state,
        participations: updateP(a.pid, (x) => ({
          ...x,
          status: 'selesai',
          paidAt: now(),
          review: { rating: a.rating, comment: a.comment, date: now() },
        })),
        notifs: [...extra, ...state.notifs],
      }
    }
    case 'REQUEST_REVISION': {
      const [p, quest] = questOf(a.pid)
      const extra = p.workerId === ME_WORKER
        ? [notif('pekerja', 'revisi', 'Brand meminta revisi', `${quest.title}: "${a.note}"`, `/p/kerja/${p.id}`)]
        : []
      return {
        ...state,
        participations: updateP(a.pid, (x) => ({ ...x, status: 'revisi', revisionNote: a.note })),
        notifs: [...extra, ...state.notifs],
      }
    }

    case 'SAVE_QUEST': {
      const exists = state.quests.some((q) => q.id === a.quest.id)
      const quests = exists ? state.quests.map((q) => (q.id === a.quest.id ? a.quest : q)) : [a.quest, ...state.quests]
      const total = a.quest.slots * a.quest.budget
      const brandTx = a.quest.status === 'aktif'
        ? [
            { id: uid('bt'), type: 'fee', label: `Biaya layanan 5%: ${a.quest.title}`, amount: -Math.round(total * 0.05), date: now() },
            { id: uid('bt'), type: 'escrow', label: `Dana quest: ${a.quest.title}`, amount: -total, date: now() },
            ...state.brandTx,
          ]
        : state.brandTx
      return { ...state, quests, brandTx }
    }
    case 'CLOSE_QUEST': {
      const quest = state.quests.find((q) => q.id === a.questId)
      const used = state.participations.filter((p) => p.questId === a.questId && p.status === 'selesai').length
      const refund = (quest.slots - used) * quest.budget
      const brandTx = refund > 0
        ? [{ id: uid('bt'), type: 'refund', label: `Pengembalian sisa dana: ${quest.title}`, amount: refund, date: now() }, ...state.brandTx]
        : state.brandTx
      return { ...state, quests: state.quests.map((q) => (q.id === a.questId ? { ...q, status: 'selesai' } : q)), brandTx }
    }
    case 'DELETE_QUEST':
      return { ...state, quests: state.quests.filter((q) => q.id !== a.questId) }

    case 'TOPUP':
      return {
        ...state,
        brandTx: [{ id: uid('bt'), type: 'topup', label: `Top up via ${a.method}`, amount: a.amount, date: now() }, ...state.brandTx],
      }
    case 'WITHDRAW':
      return { ...state, withdrawals: [{ id: uid('wd'), amount: a.amount, bank: a.bank, date: now() }, ...state.withdrawals] }
    case 'SET_TARGET':
      return { ...state, target: a.target }

    case 'READ_NOTIFS':
      return { ...state, notifs: state.notifs.map((n) => (n.role === a.role ? { ...n, read: true } : n)) }
    case 'READ_NOTIF':
      return { ...state, notifs: state.notifs.map((n) => (n.id === a.id ? { ...n, read: true } : n)) }

    case 'RESET':
      return { ...seed(), auth: state.auth }
    default:
      return state
  }
}

const StoreCtx = createContext(null)

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toast, setToast] = useState(null)
  const timer = useRef()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* abaikan */
    }
  }, [state])

  const showToast = useCallback((msg, kind = 'success') => {
    clearTimeout(timer.current)
    setToast({ msg, kind, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const value = useMemo(() => ({ state, dispatch, toast, showToast }), [state, toast, showToast])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)

/* ---------- Selector / helper ---------- */

export const ACTIVE_STATUSES = ['berjalan', 'ditinjau', 'revisi', 'selesai']

export function useQuestHelpers() {
  const { state } = useStore()
  return useMemo(() => {
    const filled = (q) => q.baseFilled + state.participations.filter((p) => p.questId === q.id).length
    const participantsOf = (qid) => state.participations.filter((p) => p.questId === qid)
    const myParticipation = (qid) => state.participations.find((p) => p.questId === qid && p.workerId === ME_WORKER)
    const quest = (id) => state.quests.find((q) => q.id === id)
    const participation = (id) => state.participations.find((p) => p.id === id)
    return { filled, participantsOf, myParticipation, quest, participation }
  }, [state.participations, state.quests])
}

export function useWorkerFinance() {
  const { state } = useStore()
  return useMemo(() => {
    const payments = state.participations
      .filter((p) => p.workerId === ME_WORKER && p.status === 'selesai' && p.paidAt)
      .map((p) => {
        const q = state.quests.find((x) => x.id === p.questId)
        return { id: p.id, type: 'in', label: q.title, sub: BRANDS[q.brandId].name, amount: q.budget, date: p.paidAt }
      })
    const outs = state.withdrawals.map((w) => ({ id: w.id, type: 'out', label: 'Tarik saldo', sub: w.bank, amount: w.amount, date: w.date }))
    const tx = [...payments, ...outs].sort((a, b) => new Date(b.date) - new Date(a.date))
    const totalIn = payments.reduce((s, x) => s + x.amount, 0)
    const totalOut = outs.reduce((s, x) => s + x.amount, 0)
    const pending = state.participations
      .filter((p) => p.workerId === ME_WORKER && ['berjalan', 'ditinjau', 'revisi'].includes(p.status))
      .reduce((s, p) => s + (state.quests.find((q) => q.id === p.questId)?.budget || 0), 0)
    const t = state.target
    const targetSaved = t ? payments.filter((x) => new Date(x.date) >= new Date(t.createdAt)).reduce((s, x) => s + x.amount, 0) : 0
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const thisMonth = payments.filter((x) => new Date(x.date) >= monthStart).reduce((s, x) => s + x.amount, 0)
    const avgPay = payments.length ? totalIn / payments.length : 300000
    return { tx, payments, balance: totalIn - totalOut, totalIn, pending, targetSaved, thisMonth, avgPay }
  }, [state.participations, state.quests, state.withdrawals, state.target])
}

export function useBrandFinance() {
  const { state } = useStore()
  return useMemo(() => {
    const balance = state.brandTx.reduce((s, t) => s + t.amount, 0)
    const myQuests = state.quests.filter((q) => q.brandId === ME_BRAND && q.status === 'aktif')
    const held = myQuests.reduce((s, q) => {
      const paid = state.participations.filter((p) => p.questId === q.id && p.status === 'selesai').length
      return s + (q.slots - paid) * q.budget
    }, 0)
    const paidOut = state.participations
      .filter((p) => p.status === 'selesai' && state.quests.find((q) => q.id === p.questId)?.brandId === ME_BRAND)
      .reduce((s, p) => s + state.quests.find((q) => q.id === p.questId).budget, 0)
    return { balance, held, paidOut }
  }, [state.brandTx, state.quests, state.participations])
}
