const DAY = 86400000

export const rupiah = (n = 0) => 'Rp' + Math.round(n).toLocaleString('id-ID')

export const rupiahSingkat = (n = 0) => {
  if (n >= 1e6) return 'Rp' + (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt'
  if (n >= 1e3) return 'Rp' + Math.round(n / 1e3).toLocaleString('id-ID') + ' rb'
  return 'Rp' + n
}

export const tanggal = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export const tanggalPendek = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export const sisaHari = (iso) => Math.ceil((new Date(iso).setHours(23, 59, 59) - Date.now()) / DAY)

export const labelSisaHari = (iso) => {
  const d = sisaHari(iso)
  if (d < 0) return 'Berakhir'
  if (d === 0) return 'Hari ini'
  if (d === 1) return 'Besok'
  return `${d} hari lagi`
}

export const waktuLalu = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} hari lalu`
  return tanggalPendek(iso)
}

export const hariIni = (offsetDays = 0, hour = 9) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const toInputDate = (iso) => new Date(iso).toISOString().slice(0, 10)

export const angka = (s) => Number(String(s).replace(/\D/g, '')) || 0

export const sapaan = () => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export const uid = (p = 'id') => p + Math.random().toString(36).slice(2, 8)
