# 💈 BarberHub — الحانوت متاعك، ديجيتال

> The Tunisian Barber Shop Management Platform — Hybrid queue & booking, commission tracking, and deep localization built for the *hajjem* ecosystem.

## Overview

BarberHub is a B2B2C SaaS platform designed specifically for Tunisian barber shops. It solves real problems that global booking systems ignore:

- **Queue TV Display** — A smart TV showing the live queue eliminates "whose turn is it?" arguments
- **Hybrid Booking + Walk-in** — Handles both time-slot bookings and one-tap walk-in check-ins in a single dashboard
- **Barber Commission Tracker** — Automatic daily payout calculation (50/50 or custom split) so staff *depends* on the app
- **Derja-First Interface** — Client-facing PWA in Tunisian Arabic, admin dashboard in French
- **Tunisian Payments** — Flouci + Konnect integration for micro-deposits and payments

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js · Express · TypeScript · Socket.io |
| **Database** | PostgreSQL · Prisma ORM |
| **Frontend** | Next.js 16 · React 19 · Tailwind CSS v4 |
| **Real-time** | Socket.io (queue updates, TV display) |
| **i18n** | Tunisian Derja (RTL) + French (LTR) |
| **PWA** | Progressive Web App — no app store install needed |
| **Auth** | JWT (phone-based registration) |

## Project Structure

```
BarberHub/
├── backend/                 # Express API server
│   ├── prisma/              # Database schema & migrations
│   │   └── schema.prisma    # 8 models: User, Shop, Barber, Service, Booking, QueueEntry, Payout
│   └── src/
│       ├── config/          # Environment & Socket.io config
│       ├── controllers/     # Route handlers (auth, shop, booking, queue, payout)
│       ├── middleware/       # JWT auth, validation, error handling, rate limiting
│       ├── routes/          # API routes under /api/v1
│       ├── services/        # Business logic layer
│       ├── types/           # TypeScript type definitions
│       └── utils/           # Utility functions
├── frontend/                # Next.js PWA
│   └── src/
│       ├── app/[locale]/    # 13 routes (landing, book, queue, tv, dashboard×7)
│       ├── components/      # 20+ reusable components (UI, queue, booking, dashboard)
│       ├── hooks/           # Custom hooks (useQueue, useAuth, useApi)
│       ├── i18n/messages/   # Derja + French translation files
│       └── lib/             # API client, Socket.io, types, utils
├── docker-compose.yml       # Full stack: PostgreSQL + Backend + Frontend
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- npm

### Option 1: Docker (Recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL, the backend API (port 3001), and the frontend (port 3000).

### Option 2: Manual Setup

**1. Database**
```bash
# Start PostgreSQL and create a database named 'barberhub'
```

**2. Backend**
```bash
cd backend
cp .env.example .env          # Edit with your database URL and secrets
npm install
npx prisma generate
npx prisma migrate dev         # Creates tables
npm run dev                    # Starts on http://localhost:3001
```

**3. Frontend**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                    # Starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (phone + name + password) |
| POST | `/api/v1/auth/login` | Login (phone + password) → JWT |
| POST | `/api/v1/shops` | Create shop (OWNER) |
| GET | `/api/v1/shops/:slug` | Get shop by slug (public) |
| GET | `/api/v1/shops/:id/services` | List services |
| GET | `/api/v1/shops/:id/barbers` | List barbers |
| POST | `/api/v1/bookings` | Create booking (CLIENT) |
| GET | `/api/v1/bookings/shop/:shopId` | List shop bookings |
| PATCH | `/api/v1/bookings/:id/status` | Update booking status |
| POST | `/api/v1/queue` | Add walk-in to queue |
| GET | `/api/v1/queue/shop/:shopId` | Get current queue (public — TV display) |
| PATCH | `/api/v1/queue/:id/start` | Start serving client |
| PATCH | `/api/v1/queue/:id/complete` | Complete service |
| GET | `/api/v1/payouts/shop/:shopId/daily` | Daily payout summary |
| POST | `/api/v1/payouts/:id/mark-paid` | Mark payout as paid |

## Key Pages

| URL | Purpose | Language |
|-----|---------|----------|
| `/derja` | Landing page (clients) | Tunisian Derja (RTL) |
| `/fr` | Landing page (owners) | French (LTR) |
| `/derja/book/:shopSlug` | Client booking flow | Derja |
| `/derja/queue/:shopSlug` | Queue check-in & wait view | Derja |
| `/derja/tv/:shopSlug` | Queue TV Display (fullscreen) | Derja |
| `/fr/dashboard` | Owner admin dashboard | French |
| `/fr/dashboard/queue` | Queue management | French |
| `/fr/dashboard/payouts` | Daily commission tracker | French |

## Real-time Features

The Queue TV Display and dashboard use Socket.io for live updates:

- Clients join `shop:{shopId}` room for queue position updates
- TV displays join `tv:{shopId}` room for fullscreen queue rendering
- All queue mutations (add, start, complete, cancel) broadcast updates to connected clients

## Environment Variables

### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barberhub
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FLOUCI_APP_TOKEN=         # Flouci payment gateway
FLOUCI_APP_SECRET=
KONNECT_API_KEY=          # Konnect payment gateway
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Roadmap

- [x] Backend API (auth, shops, bookings, queue, payouts)
- [x] Database schema (Prisma + PostgreSQL)
- [x] Frontend PWA (Next.js + Tailwind)
- [x] i18n (Tunisian Derja + French)
- [x] Queue TV Display (real-time)
- [x] Commission tracker dashboard
- [x] Docker Compose setup
- [ ] WhatsApp Business API reminders
- [ ] Flouci/Konnect payment integration
- [ ] OTP phone verification
- [ ] Barber availability scheduling
- [ ] Analytics & reporting dashboard
- [ ] Inventory tracking module
- [ ] Startup Act label integration

## License

MIT