This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ChargingStation Manager

A full-stack Next.js application to manage EV charging station records with a live dashboard, CRUD operations, and admin-gated controls.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | SQLite via `better-sqlite3` |
| Validation | Zod |
| Styling | Custom CSS (no UI library) |

---

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/arbinchargingstations.git
cd arbinchargingstations/frontend
```

### 2. Install dependencies

```bash
npm install
```

This installs all packages including `better-sqlite3`, `zod`, and Next.js.

### 3. Configure environment variables (optional)

The app works out of the box with default values. To change the admin key, create a `.env.local` file in the `frontend/` directory:

```bash
# frontend/.env.local

# Server-side key checked by the API routes (default: admin123)
ADMIN_KEY=your-secret-admin-key

# Client-side key used by the UI to unlock admin actions (must match ADMIN_KEY)
NEXT_PUBLIC_ADMIN_KEY=your-secret-admin-key
```

> If you skip this step, both keys default to **`admin123`**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The SQLite database file is automatically created at `data/charging-stations.db` on the first API request — no manual database setup required.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server at `http://localhost:3000` |
| `npm run build` | Create an optimised production build |
| `npm start` | Serve the production build (run `build` first) |
| `npm run lint` | Run ESLint across the project |

---

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # All custom styles + animations
│   ├── layout.tsx           # Root HTML layout + metadata
│   ├── page.tsx             # Client-side dashboard (single page)
│   └── api/
│       └── stations/
│           ├── route.ts     # GET all, POST new station
│           └── [id]/
│               └── route.ts # GET, PUT, DELETE by id
├── lib/
│   └── stations.ts          # SQLite data layer (CRUD functions)
├── data/                    # Auto-created — holds charging-stations.db
├── public/                  # Static assets
├── .env.local               # Your local env vars (not committed)
└── package.json
```

---

## API Reference

All endpoints are relative to `http://localhost:3000`.

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/stations` | No | Fetch all stations |
| `POST` | `/api/stations` | Yes | Create a new station |
| `GET` | `/api/stations/:id` | No | Fetch a single station |
| `PUT` | `/api/stations/:id` | Yes | Update a station |
| `DELETE` | `/api/stations/:id` | Yes | Delete a station |

**Admin authentication** — protected endpoints require an `x-admin-key` header:

```
x-admin-key: admin123
```

### Example: Create a station

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "x-admin-key: admin123" \
  -d '{
    "stationName": "Central EV Hub",
    "locationAddress": "42 MG Road, Bangalore",
    "pinCode": "560001",
    "connectorType": "CCS",
    "status": "Operational",
    "locationLink": "https://maps.google.com/?q=MG+Road+Bangalore"
  }'
```

---

## Using the Dashboard

1. Open [http://localhost:3000](http://localhost:3000)
2. The station cards and live stats load automatically
3. To create, edit, or delete stations — enter the admin key (`admin123`) in the **Admin Key** field
4. The **"✓ Admin Unlocked"** badge confirms access


