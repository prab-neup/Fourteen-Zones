# Technical decisions

Each decision records what we shipped, why, what else we considered, and why we rejected it. Alternatives are real options for this assignment, not straw men.

---

## 1. Feature hooks for async state, not Redux or TanStack Query

**What was chosen?**  
Screen hooks (`useServiceList`, `useServiceDetails`, `useBooking`, `useBookings`) own loading, empty, error, and form state. They call `api/services` functions.

**Why was it chosen?**  
The brief says hooks manage screen-level state and call API service functions. That coordination is the thing being graded. Five screens do not need a global cache.

**What alternatives were considered?**  
- Redux / Zustand for all API state  
- TanStack Query for `isLoading` / cache / retries

**Why were the alternatives rejected?**  
Redux would add actions, reducers, and a store for data that dies with the page. TanStack Query would own async state and hide the hook layer the assignment asked us to write. Either library is fine in a larger app; here it would look like we outsourced the architecture.

---

## 2. Custom `HttpClient`, not Axios

**What was chosen?**  
A small `HttpClient` interface with `request` / `requestEnvelope`. Default implementation is the mock client. `VITE_API_MODE=http` switches to `fetch`.

**Why was it chosen?**  
The brief asks for an HTTP client that executes requests, parses responses, and normalizes errors, and a mock that can be replaced later. One interface does both.

**What alternatives were considered?**  
- Axios  
- Calling `fetch` from feature hooks  
- Importing mock handlers from React pages

**Why were the alternatives rejected?**  
Axios is unused in mock mode and would wrap a library instead of showing the boundary. Hooks calling `fetch` would leak URLs and status codes into the UI. Pages importing mock data would break “no hardcoded component-level data.”

---

## 3. Validation and conflicts live in the mock API, not Zod + React Hook Form

**What was chosen?**  
The mock handlers return `422 VALIDATION_ERROR` with `details[]` and `409 SLOT_UNAVAILABLE`. Hooks map those onto fields or the date/time step. The UI only blocks obvious incomplete steps (no slot, no customer) so we do not send an empty POST.

**Why was it chosen?**  
The contract is the source of truth. A real backend will enforce the same rules. Showing API errors proves the client can handle the documented envelopes.

**What alternatives were considered?**  
- Zod schemas + React Hook Form  
- Validating only in React and always sending a “happy” POST

**Why were the alternatives rejected?**  
A second schema would drift from the mock. If the UI never received a `422` or `409`, the error-handling requirement would be untested. Lightweight “Continue” checks are UX, not a replacement for server rules.

---

## 4. Feature folders, not type-based folders

**What was chosen?**  
`features/services`, `features/booking`, and `features/bookings` each hold that flow’s page, hook, and local UI. Shared widgets stay in `components/`.

**Why was it chosen?**  
The brief draws feature boundaries. A booking change should not require hunting through `pages/`, `hooks/`, and `components/` for three files that only make sense together.

**What alternatives were considered?**  
- Grouping the whole app by type (`pages/`, `hooks/`, `components/`)  
- One `features/` dump with no subfolders

**Why were the alternatives rejected?**  
Type-based trees mix catalog and booking as the app grows. A flat `features/` folder would hide the three product flows the assignment named.

---

## 5. In-memory mock store that mutations actually update

**What was chosen?**  
`api/mock/store.ts` holds services, customers, and bookings. `POST /bookings` appends a row and occupies that slot. The next availability and My Bookings reads see it. A seeded 09:00 booking three days out is a real taken slot.

**Why was it chosen?**  
The brief wants booking conflict behaviour, not a static JSON file. If create did not change the store, “slot taken” would be a fake `if` in the UI.

**What alternatives were considered?**  
- Hardcoded arrays in components  
- Returning success without writing  
- `localStorage` as the database

**Why were the alternatives rejected?**  
Component arrays break API-first. A write-less mock cannot demonstrate conflict. `localStorage` would persist demo junk across scenarios and make tests order-dependent; session memory plus `resetStore()` is enough.

---

## 6. Search and category in the URL

**What was chosen?**  
`/?q=plumb&category=cleaning` is the list filter state. The search box debounces before writing the URL so typing does not spam requests.

**Why was it chosen?**  
Refresh and back keep the same results. The hook can treat the URL as the source and stay small.

**What alternatives were considered?**  
- `useState` only  
- A filter slice in a global store

**Why were the alternatives rejected?**  
Local state dies on refresh, which is awkward in a catalog. A store is another place for something the URL already models.

---

## 7. One `ApiError` type for mock and real HTTP

**What was chosen?**  
Non-2xx responses become `ApiError` with `status`, `code`, `message`, and optional `details`. Feature code never reads `response.status`.

**Why was it chosen?**  
The brief wants normalized technical errors and a replaceable client. Hooks should not care whether the body came from the in-process router or `fetch`.

**What alternatives were considered?**  
- Returning `{ ok, status, data }` from every service  
- Throwing raw `Error` strings  
- HTTP status checks in pages

**Why were the alternatives rejected?**  
Result objects push status handling into every screen. String errors lose `422` vs `409`. Pages checking status would break the layering.

---

## 8. Vitest + Testing Library, not snapshots or implementation spies

**What was chosen?**  
Tests drive `getServices` / `createBooking` and the real pages against the mock (latency 0). They assert catalog cards, error panels, `422` details, a created booking, and `409` conflicts.

**Why was it chosen?**  
The brief lists those cases and says quality over coverage. Behaviour through the public API matches how a reviewer will use the app.

**What alternatives were considered?**  
- Jest + Enzyme-style shallow render  
- Snapshotting markup  
- Mocking `getServices` in every page test

**Why were the alternatives rejected?**  
Snapshots break on class names and do not prove empty vs error. Mocking the API service in all UI tests would not exercise the mock backend the assignment asked us to build. We still render pages where that proves a state (list success/error, details, booking “Continue” without a slot).
