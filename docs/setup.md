# Setup

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer (ships with current Node)
- Git

No backend, Docker, or database. The mock API runs in the browser process.

## Installation

```bash
git clone <repository-url>
cd assignment
npm install
```

## Environment configuration

Copy the example file if you want to change defaults:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_MODE` | `mock` | `mock` uses the in-browser fake backend. `http` uses `fetch` against a real server. |
| `VITE_API_BASE_URL` | empty | Base URL for `http` mode, for example `https://api.example.com`. Unused in mock mode. |
| `VITE_MOCK_LATENCY_MS` | `450` | Artificial delay so loading states are visible. Tests set this to `0`. |

If `.env` is missing, the app still starts in mock mode with ~450ms latency.

## Running the application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Typical path:

1. Service list (`/`) — search and category chips
2. Service details (`/services/:id`)
3. Book (`/services/:id/book`) — date, slot, customer, address, confirm
4. Confirmation (`/bookings/:id/confirmed`)
5. My bookings (`/bookings`)

The header **Mock** control forces empty lists, server errors, validation errors, or slot conflicts without changing code.

```bash
npm run build
npm run preview
```

builds the production bundle and serves it locally.

## Running the mock API

There is no second process and no `npm run mock`.

With `VITE_API_MODE=mock` (the default), `createHttpClient()` returns the mock HTTP client. Every `getServices` / `createBooking` call:

1. Waits `VITE_MOCK_LATENCY_MS`
2. Routes `GET /api/v1/...` to a handler
3. Reads or updates the in-memory store
4. Returns an envelope or throws `ApiError`

To point at a real backend later:

```bash
# .env
VITE_API_MODE=http
VITE_API_BASE_URL=https://your-api.example.com
```

Feature code does not change. The server must honour `docs/api-contract.md`.

## Running tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Tests use the same mock API with latency `0` and reset the store between cases. They cover:

- Service list success and error
- Service details
- Booking validation
- Successful booking
- Slot conflict
