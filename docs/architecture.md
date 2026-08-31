# Architecture

Demo Marketplace booking is a small React module with a hard boundary between **UI**, **feature logic**, and **API**. Screens never own data. They call application API functions. Those functions talk to an HTTP client. The HTTP client is backed by a mock API today and can be swapped for a real backend later without rewriting features.

## Application architecture

```
┌─────────────────────────────────────────────────────────┐
│  Features (pages + feature hooks)                       │
│  Service list · Service details · Booking · My bookings │
└────────────────────────────┬────────────────────────────┘
                             │ typed function calls
┌────────────────────────────▼────────────────────────────┐
│  API services                                           │
│  getServices · getService · getAvailability             │
│  createBooking · listBookings · getBooking · customers  │
└────────────────────────────┬────────────────────────────┘
                             │ HttpRequest
┌────────────────────────────▼────────────────────────────┐
│  HTTP client                                            │
│  path + method + query + body → parsed data or ApiError │
└────────────────────────────┬────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
        Mock HTTP client              Fetch HTTP client
        (default)                     (future / real API)
              │
              ▼
        Mock router + handlers + in-memory store
```

Rules:

1. React components render and dispatch user actions. They do not fetch, validate bookings, or know about mock data.
2. Feature hooks own screen state: loading, empty, error, form values, and which API calls to make.
3. API services are the only application-facing network API. Components never call the HTTP client directly.
4. The HTTP client is the only place that executes requests and normalizes transport errors.
5. The mock layer is a fake backend. It owns data, latency, validation, and business rules.

## Folder structure

```
src/
├── api/
│   ├── client/          HTTP client interface + mock/fetch implementations
│   ├── services/        Application-facing API functions
│   └── mock/            Fake backend: store, handlers, scenario switches
├── features/
│   ├── services/        Service list + service details
│   ├── booking/         Date/time, customer/address, confirm
│   └── bookings/        Confirmation + my bookings + booking details
├── components/          Shared presentational UI (layout, buttons, states)
├── hooks/               Shared hooks (async request helper)
├── types/               Shared domain + API types
└── lib/                 Pure formatters (money, dates)
```

`docs/` holds architecture, API contract, decisions, and setup. Tests live next to the code they cover (`*.test.ts` / `*.test.tsx`).

## Feature boundaries

Each feature owns its pages, its screen hook, and any UI that is meaningless outside that flow.

| Feature | Routes | Owns | Does not own |
|---|---|---|---|
| **Services** | `/`, `/services/:serviceId` | Listing, search, category filter, details | Booking form, booking store |
| **Booking** | `/services/:serviceId/book` | Date, slots, customer, address, summary, submit | Catalog listing, booking history |
| **Bookings** | `/bookings`, `/bookings/:bookingId`, `/bookings/:bookingId/confirmed` | History, details, post-submit confirmation | Service catalog, slot generation |

Shared pieces stay in `components/`, `hooks/`, `types/`, and `api/`. If a component needs service data, it receives props or a hook result. It never imports mock arrays.

## Component responsibilities

**Page components** (in `features/`):

- Compose the screen
- Bind inputs to hook state
- Choose which state view to show: loading, empty, error, or success

**Feature hooks** (in `features/`):

- Call API services
- Hold form and screen state
- Map `ApiError` into field errors or a page-level message

**Shared UI** (in `components/`):

- Layout, header, buttons, badges
- Reusable loading / empty / error shells
- No feature-specific fetch logic

A typical screen looks like this:

```
ServiceListPage
  └─ useServiceList()        → { services, status, error, query, setQuery }
       └─ getServices()      → api/services
            └─ httpClient    → mock or fetch
```

## API / service layer

There are three API packages. They are intentionally separate so the mock can be replaced.

### `api/client`

Defines:

- `HttpRequest` / `HttpClient.request<T>()`
- `ApiError` (status, code, message, field details)
- a factory that returns the mock client or a real fetch client from `VITE_API_MODE`

The client always returns parsed `data` on success and throws `ApiError` on failure. Feature code never inspects raw HTTP objects.

### `api/services`

One function per contract operation, for example:

- `getServices(params)`
- `getService(serviceId)`
- `getServiceAvailability(serviceId, params)`
- `createBooking(body)`
- `getBookings(params)`
- `getBooking(bookingId)`
- `getCustomers()`

These functions:

- accept domain-friendly arguments
- build the path, query, and body
- return typed response data
- hide `/api/v1` and envelope shape from the UI

### `api/mock`

Behaves like a backend process inside the browser:

- in-memory store (services, customers, bookings)
- route handlers for each contract endpoint
- simulated latency
- validation and business rules (including slot conflicts)
- optional scenario header so empty / 500 / conflict can be demonstrated without changing components

Mock data files are not imported by React features.

## State management

No global store. State is local and scoped to the problem it solves.

| Kind of state | Where it lives | Why |
|---|---|---|
| List filters (search, category) | URL query + `useServiceList` | Shareable, refresh-safe, no extra library |
| Service details | `useServiceDetails` | Single resource, discarded when leaving the page |
| Booking draft | `useBooking` | Multi-step form that belongs to one flow |
| Booking history | `useBookings` / `useBookingDetails` | Read-only lists and detail |
| Demo scenario (empty / error / conflict) | Small mock config read by the HTTP client as a header | Demo control without leaking into domain state |

URL state is used when the user would expect the back button or a refresh to keep context (filters, selected service). Form drafts stay in memory for the booking session.

## Error handling

Errors are classified once, in the client and contract, then consumed as data by hooks.

| Class | HTTP | Example | UI treatment |
|---|---|---|---|
| Transport / unknown | — | Network failure normalized by the client | Page error + retry |
| Server | `500` | Forced mock failure | Page error + retry |
| Not found | `404` | Unknown service or booking | Page error, not a crash |
| Validation | `422` | Missing date, invalid address | Field messages on the form |
| Business | `409` | Slot already taken | Inline conflict message, offer another slot |
| Empty success | `200` + `[]` | No search matches | Empty state, not an error |

Components do not parse status codes. They render whatever the hook already classified: `status === 'loading' | 'success' | 'empty' | 'error'`, plus `fieldErrors` on the booking form.

## How the frontend talks to the API

1. The user action (search, open details, confirm booking) calls a feature hook.
2. The hook calls an `api/services` function.
3. The service builds an `HttpRequest` (`GET /api/v1/services?q=plumb`).
4. The HTTP client:
   - in **mock mode** (default): delays, routes to a handler, returns an envelope or an error
   - in **http mode** (later): `fetch(`${VITE_API_BASE_URL}${path}`)`
5. Success unwraps `{ data, meta }` and returns `data` to the hook.
6. Failure becomes `ApiError` and the hook sets error / field state.
7. The page renders loading, empty, error, or the data view.

The UI never knows whether the response came from the mock store or a server. That is the replaceability requirement.

## Out of scope

This module does not include authentication, payments, provider admin, or a real backend process. Those would sit behind the same contract and client interface if added later.
