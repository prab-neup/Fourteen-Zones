# Demo Marketplace — Customer Service Booking

Production-style React module for the Demo Marketplace customer booking flow.

**Customer → Service list → Service details → Date & time → Confirm → Confirmation → My bookings**

The work is organised around architecture, an API contract, a replaceable mock API, and explicit loading / empty / error states. Visual design is secondary.

## Demo video

Jam link: _add the recording URL here before submission._

The recording should show: catalog search and filters, a service detail, a successful booking, My Bookings, then the header **Mock** control for empty, server error, validation, and slot conflict.

## Stack

- React 19 + TypeScript + Vite
- React Router
- In-browser mock HTTP API (no backend)
- Vitest + Testing Library

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The mock API starts with the app. Full install, env, and test notes: [docs/setup.md](docs/setup.md).

```bash
npm test
```

## Documentation

| Doc | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Layers, folders, features, state, errors |
| [docs/api-contract.md](docs/api-contract.md) | Endpoints, bodies, status codes, empty/error behaviour |
| [docs/decisions.md](docs/decisions.md) | What we chose, alternatives, why not |
| [docs/setup.md](docs/setup.md) | Prerequisites, env, run app, run mock, run tests |

## How the frontend talks to data

Screens do not own arrays of services or bookings. They call `getServices`, `getService`, `getServiceAvailability`, `getCustomers`, `createBooking`, `getBookings`, and `getBooking`. Those functions use an `HttpClient`. In mock mode the client is an in-memory router; in `http` mode it is `fetch`.

## Project layout

```
src/
├── api/client/      HttpClient + ApiError + mock/fetch
├── api/services/    Application API functions
├── api/mock/        Fake backend, store, handlers
├── features/        services · booking · bookings
├── components/      Layout and shared states
├── hooks/           Shared hooks
└── types/           Shared types
```
