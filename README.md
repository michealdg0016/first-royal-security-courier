# 👑 First Royal Security Company

> *Excellence · Security · Royalty*

A full-stack international courier platform with real-time package tracking, a super admin control panel, customer dashboards, and persuasive marketing landing page.

---

## 🚀 Quick Start

```bash
# From project root
bash start.sh
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:5000

---

## 🔑 Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Super Admin | `admin@firstroyalsecurity.com` | `Royal@Admin2024!` |
| 👤 Demo Customer | `james@example.com` | `Customer123!` |

**Demo tracking codes:** `FRSC-A1B2-C3D4-E5F6` · `FRSC-P3Q4-R5S6-T7U8`

---

## 🏗 Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Bun + Express.js |
| Database | SQLite (bun:sqlite, built-in) |
| Auth | JWT (7-day tokens) |
| Styling | Custom CSS — Royal gold/navy theme |

---

## ✨ Features

### Landing Page
- Persuasive hero with live tracking input
- Stats banner (150+ countries, 10M+ deliveries, 99.8% on-time)
- 4 service cards: International Express, Secure Freight, Priority Royal, Corporate Solutions
- 6 Why-Us cards, 4-step how-it-works, 3 client testimonials
- Full footer with certifications

### Package Tracking
- Public tracking by unique `FRSC-XXXX-XXXX-XXXX` code
- Visual 10-stage progress bar
- Animated timeline with location history

### Customer Dashboard
- All shipments at a glance
- Frozen shipment alerts

### Super Admin Panel
- **Command Centre** — live stats (total, in-transit, delivered, frozen, users)
- **Shipments** — search, filter by status/state, full modal management:
  - ⬆ Progress to next stage
  - ⬇ Step back
  - 🎯 Jump to any status directly
  - ❄️ Freeze / 🔥 Unfreeze shipment
  - 📅 Edit estimated delivery date
  - 🗑 Delete
- **Create Shipment** — full form, 100+ countries, auto-generates tracking code
- **Users** — suspend / reinstate accounts (super admin protected)

---

## 📁 Structure

```
first-royal-courier/
├── backend/
│   └── src/
│       ├── db/setup.js        # SQLite + seed data
│       ├── middleware/auth.js  # JWT middleware
│       └── routes/            # auth, shipments, admin
├── frontend/
│   └── src/
│       ├── pages/             # Home, Track, Login, Signup, Dashboard, Admin/*
│       ├── components/        # Navbar, Footer
│       ├── context/           # AuthContext
│       └── index.css          # Royal theme (gold + navy)
└── start.sh
```
