# Garapin — Mobile Web Mockup

A clickable, mobile-only mockup of a quest-based gig app (fully in Bahasa Indonesia). There is **no backend**: all data is mock data in a single store and is saved in the browser's `localStorage`, so actions on one side show up on the other.

- **Brand** opens quests (title, description, category, location, tasks, requirements, timeline, slots, budget) and reviews, pays, and rates workers.
- **Pekerja** browses and takes quests, ticks off tasks, submits proof, gets paid and reviewed, and tracks a financial target.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/ (relative paths, can be hosted anywhere)
```

## Deploying to GitHub Pages

The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys automatically on every push to `main`.

1. Push the repo to GitHub (branch `main`).
2. In the repo, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open the **Actions** tab and wait for "Deploy ke GitHub Pages" to finish. The site will be at `https://<username>.github.io/<repo-name>/`.

The build works under any repo name without config changes: assets use relative paths (`base: './'`) and routing uses `#/` URLs, so refreshing a page or opening a deep link never 404s.

On a phone the app fills the screen. On desktop it shows inside a phone frame, and on wide screens (≥960px) a **Panel Demo** appears with a role switcher, a guided flow, and a data reset.

## Demo flow

1. **Brand** → `+` button → "Isi contoh" → go through the 5 steps → *Terbitkan Quest*
2. **Pekerja** → Jelajah → open the new quest → *Ambil Quest*
3. **Pekerja** → tick every task → upload proof (simulated) → *Kirim Hasil Kerja*
4. **Brand** → Notifikasi / Quest → *Tinjau* → *Setujui & Bayar* with a rating (or *Minta Revisi*)
5. **Pekerja** → Dompet and Target go up, and the payment and review notifications arrive

Switch roles from **Profil → Mode Demo** or from the desktop panel.

## Screen map

| Route | Screen |
|---|---|
| `/`, `/onboarding`, `/peran`, `/masuk/:role` | Splash, onboarding, role choice, OTP login |
| `/p/beranda` | Pekerja home: balance, target, ongoing quests, categories, recommendations |
| `/p/jelajah` | Search, category filter, sort |
| `/p/quest/:id` | Quest detail + take-quest confirmation |
| `/p/quest` | Quest Saya (Berjalan / Ditinjau / Selesai) |
| `/p/kerja/:pid` | Work progress: task checklist, upload proof, revision, payment + review |
| `/p/dompet`, `/p/tarik` | Wallet, transaction history, withdrawal |
| `/p/target` | Financial target: progress ring, milestones, plan, suggested quests |
| `/p/profil`, `/p/ulasan` | Profile, level/XP, reviews |
| `/b/beranda` | Brand dashboard: balance, held funds, items awaiting review, stats |
| `/b/buat`, `/b/buat/:id` | 5-step quest creation (Info, Tasks & Requirements, Schedule & Slots, Budget, Review) / edit a draft |
| `/b/quest` | Quest list (Aktif / Tinjau / Draf / Selesai) |
| `/b/quest/:id` | Manage a quest: slots, workers, budget, close the quest (refunds the remaining funds) |
| `/b/tinjau/:pid` | Review a worker: approve & pay + rating, or request a revision |
| `/b/dompet`, `/b/topup` | Brand wallet, worker payments, top up |
| `/p/notifikasi`, `/b/notifikasi`, `/sukses` | Notifications, success page |

## Structure (for backend work later)

```
src/
  data/mock.js         seed data (quests, participations, brands, workers, ...)
  store/AppStore.jsx   reducer + every action (TAKE_QUEST, SUBMIT_WORK, APPROVE_WORK, ...)
                       — these map one-to-one to future API endpoints
  components/          UI building blocks (Layout, QuestCard, ui)
  screens/{auth,pekerja,brand,shared}/
```

Core domain model: **Quest** (has `slots`, `budget` per worker, `objectives`, `requirements`, `startDate`/`endDate`, `status`) ↔ **Participation** (worker × quest, `status`: `berjalan` → `ditinjau` → `revisi`/`selesai`, `progress[]`, `files`, `review`, `paidAt`).

Stack: Vite + React 18 + React Router (HashRouter) + lucide-react. Plain CSS (`src/styles.css`), font: Plus Jakarta Sans.
