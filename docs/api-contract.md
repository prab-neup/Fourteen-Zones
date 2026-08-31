# API contract

This contract is the source of truth for the booking module. The frontend is implemented against these endpoints, not against hardcoded component data. The mock API implements the same shapes so it can be replaced by a real HTTP backend later.

Base path: `/api/v1`

Default envelope:

```json
{
  "data": {},
  "meta": {}
}
```

Error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "scheduledStart", "message": "Date and time are required" }
    ]
  }
}
```

`details` is present for validation errors. It is omitted for business and server errors.

Conventions:

- IDs are opaque strings (`svc_1001`, `bkg_2001`).
- Money is an integer **minor unit** plus an ISO currency code (`price: 8500`, `currency: "USD"` → $85.00). That avoids float rounding in UI and backend.
- Date-only values are `YYYY-MM-DD`.
- Date-times are ISO-8601 UTC (`2026-09-15T10:00:00.000Z`).
- Collection endpoints return `data: []` with `200` when there are no rows. Empty is not an error.
- The mock client simulates latency (default ~450ms). The UI must always handle a loading state for every request.

Supporting endpoint `GET /api/v1/customers` is included so customer and address selection is API-driven. It is not in the assignment minimum list, but the booking flow requires it.

---

## Shared types

### Service

```json
{
  "id": "svc_1001",
  "name": "Deep home cleaning",
  "description": "Full apartment clean including kitchen and bathrooms.",
  "category": "cleaning",
  "provider": {
    "id": "prv_10",
    "name": "Northside Home Care"
  },
  "price": 8500,
  "currency": "USD",
  "durationMinutes": 120,
  "rating": 4.8,
  "reviewCount": 124,
  "availability": "available"
}
```

`availability` is a catalog hint, not a slot list: `available` | `limited` | `unavailable`.

### Time slot

```json
{
  "start": "2026-09-15T10:00:00.000Z",
  "end": "2026-09-15T12:00:00.000Z",
  "available": true
}
```

### Customer and address

```json
{
  "id": "cus_01",
  "name": "Maya Chen",
  "email": "maya.chen@example.com",
  "addresses": [
    {
      "id": "addr_01",
      "label": "Home",
      "line1": "18 Oak Street",
      "city": "Austin",
      "postalCode": "78701"
    }
  ]
}
```

### Booking

```json
{
  "id": "bkg_2001",
  "bookingNumber": "DM-20481",
  "serviceId": "svc_1001",
  "serviceName": "Deep home cleaning",
  "providerName": "Northside Home Care",
  "customerId": "cus_01",
  "customerName": "Maya Chen",
  "addressId": "addr_01",
  "addressSummary": "Home — 18 Oak Street, Austin",
  "scheduledStart": "2026-09-15T10:00:00.000Z",
  "scheduledEnd": "2026-09-15T12:00:00.000Z",
  "status": "confirmed",
  "totalPrice": 8500,
  "currency": "USD",
  "createdAt": "2026-09-01T08:12:00.000Z"
}
```

`status`: `confirmed` | `cancelled` | `completed`.

### Error codes

| Code | HTTP | Class |
|---|---|---|
| `VALIDATION_ERROR` | `422` | Request fields failed validation |
| `NOT_FOUND` | `404` | Service, booking, or customer does not exist |
| `SLOT_UNAVAILABLE` | `409` | Selected slot is taken or no longer offered |
| `SERVICE_UNAVAILABLE` | `409` | Service cannot be booked |
| `INTERNAL_ERROR` | `500` | Unexpected server failure |

---

## `GET /api/v1/services`

**Purpose:** List bookable services. Supports search and category filter for the service list screen.

### Request parameters

| Name | In | Required | Description |
|---|---|---|---|
| `q` | query | no | Case-insensitive search on name, description, provider, category |
| `category` | query | no | Exact category key (`cleaning`, `plumbing`, `electrical`, `wellness`, `tutoring`, `moving`) |
| `page` | query | no | 1-based page. Default `1` |
| `pageSize` | query | no | Default `12`, max `50` |

No request body.

### Response body `200`

```json
{
  "data": [
    { "id": "svc_1001", "name": "Deep home cleaning" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 12,
    "total": 8
  }
}
```

Each item is a full **Service** object.

### Status codes

| Status | When |
|---|---|
| `200` | Success, including zero results |
| `422` | `page` or `pageSize` invalid |
| `500` | Server failure |

### Validation errors

- `page` must be an integer ≥ 1
- `pageSize` must be an integer 1–50

### Business errors

None. Unknown `category` or `q` with no matches is a successful empty list.

### Loading / empty / error behaviour

| State | Contract | UI |
|---|---|---|
| Loading | Request in flight | Skeleton list. Do not show empty or error. |
| Empty | `200` + `data: []` + `meta.total: 0` | Empty copy. If `q` or `category` is set, treat as “no matches”. |
| Error | `422` / `500` or transport failure | Error panel + retry. Do not render stale cards as current. |

---

## `GET /api/v1/services/{service_id}`

**Purpose:** Load one service for the details screen and as the booking header.

### Request parameters

| Name | In | Required | Description |
|---|---|---|---|
| `service_id` | path | yes | Service id |

No request body.

### Response body `200`

```json
{
  "data": {
    "id": "svc_1001",
    "name": "Deep home cleaning",
    "description": "Full apartment clean including kitchen and bathrooms.",
    "category": "cleaning",
    "provider": { "id": "prv_10", "name": "Northside Home Care" },
    "price": 8500,
    "currency": "USD",
    "durationMinutes": 120,
    "rating": 4.8,
    "reviewCount": 124,
    "availability": "available"
  }
}
```

### Status codes

| Status | When |
|---|---|
| `200` | Service found |
| `404` | Unknown `service_id` |
| `500` | Server failure |

### Validation errors

None beyond a missing path id, which the client will not send.

### Business errors

- `NOT_FOUND` if the service does not exist.

### Loading / empty / error behaviour

| State | Contract | UI |
|---|---|---|
| Loading | Request in flight | Details skeleton. Booking CTA disabled. |
| Empty | Not used. Missing service is `404`, not empty. | — |
| Error | `404` / `500` | Error panel. `404` copy: service not found. Offer return to list. |

---

## `GET /api/v1/services/{service_id}/availability`

**Purpose:** Return bookable slots for a service on one calendar date.

### Request parameters

| Name | In | Required | Description |
|---|---|---|---|
| `service_id` | path | yes | Service id |
| `date` | query | yes | Calendar date `YYYY-MM-DD` |

No request body.

### Response body `200`

```json
{
  "data": {
    "serviceId": "svc_1001",
    "date": "2026-09-15",
    "slots": [
      {
        "start": "2026-09-15T10:00:00.000Z",
        "end": "2026-09-15T12:00:00.000Z",
        "available": true
      },
      {
        "start": "2026-09-15T13:00:00.000Z",
        "end": "2026-09-15T15:00:00.000Z",
        "available": false
      }
    ]
  }
}
```

A day with no openings still returns `200` with `slots: []` or with every slot `available: false`. That is empty availability, not an error.

### Status codes

| Status | When |
|---|---|
| `200` | Service exists; slots may be empty |
| `404` | Unknown `service_id` |
| `422` | Missing or invalid `date` |
| `500` | Server failure |

### Validation errors

| Field | Rule |
|---|---|
| `date` | Required. Must match `YYYY-MM-DD`. Must be a real calendar date. |

### Business errors

- `NOT_FOUND` if the service does not exist.
- Booking a slot that is `available: false` later fails on `POST /bookings` with `SLOT_UNAVAILABLE`. This endpoint does not reject those slots; it marks them unavailable so the UI can disable them.

### Loading / empty / error behaviour

| State | Contract | UI |
|---|---|---|
| Loading | Request in flight after date change | Slot skeleton. Keep the selected date. |
| Empty | `200` + no available slots | “No times on this date.” User picks another date. |
| Error | `404` / `422` / `500` | Error on the date/time step. Invalid date shows a field error. |

---

## `POST /api/v1/bookings`

**Purpose:** Create a booking for a service, customer, address, and start time.

### Request parameters

None.

### Request body

```json
{
  "serviceId": "svc_1001",
  "customerId": "cus_01",
  "addressId": "addr_01",
  "scheduledStart": "2026-09-15T10:00:00.000Z"
}
```

| Field | Required | Description |
|---|---|---|
| `serviceId` | yes | Existing service |
| `customerId` | yes | Existing customer |
| `addressId` | yes | Address that belongs to that customer |
| `scheduledStart` | yes | Slot start. Must match an **available** slot for that service |

`scheduledEnd`, price, and booking number are computed by the server from the service duration and catalog price. The client must not send them.

### Response body `201`

```json
{
  "data": {
    "id": "bkg_2001",
    "bookingNumber": "DM-20481",
    "serviceId": "svc_1001",
    "serviceName": "Deep home cleaning",
    "providerName": "Northside Home Care",
    "customerId": "cus_01",
    "customerName": "Maya Chen",
    "addressId": "addr_01",
    "addressSummary": "Home — 18 Oak Street, Austin",
    "scheduledStart": "2026-09-15T10:00:00.000Z",
    "scheduledEnd": "2026-09-15T12:00:00.000Z",
    "status": "confirmed",
    "totalPrice": 8500,
    "currency": "USD",
    "createdAt": "2026-09-01T08:12:00.000Z"
  }
}
```

The created booking occupies that slot. A second `POST` with the same `serviceId` + `scheduledStart` returns `409`.

### Status codes

| Status | When |
|---|---|
| `201` | Booking created |
| `404` | Service or customer does not exist |
| `409` | Slot conflict, or service is not bookable |
| `422` | Missing / invalid fields, or address not on the customer |
| `500` | Server failure |

### Validation errors (`422`, `VALIDATION_ERROR`)

| Field | Rule |
|---|---|
| `serviceId` | Required string |
| `customerId` | Required string |
| `addressId` | Required string. Must belong to `customerId` |
| `scheduledStart` | Required ISO-8601 UTC date-time. Must be in the future |

### Business errors

| Code | HTTP | When |
|---|---|---|
| `NOT_FOUND` | `404` | `serviceId` or `customerId` does not exist |
| `SLOT_UNAVAILABLE` | `409` | Start is not an open slot, or another booking already holds it |
| `SERVICE_UNAVAILABLE` | `409` | Service `availability` is `unavailable` |

### Loading / empty / error behaviour

| State | Contract | UI |
|---|---|---|
| Loading | Request in flight | Confirm button pending. Do not double-submit. |
| Empty | Not applicable | — |
| Validation error | `422` | Map `error.details[]` onto fields. Stay on the form. |
| Conflict | `409 SLOT_UNAVAILABLE` | Message on the date/time step. Reload availability. Clear the chosen slot. |
| Server error | `500` | Page-level error. Keep the draft so the user can retry. |

---

## `GET /api/v1/bookings`

**Purpose:** List the current customer’s bookings for My Bookings.

This assignment has no auth layer. The mock treats the list as the session booking history (all bookings in the store). A real backend would scope by the authenticated user.

### Request parameters

| Name | In | Required | Description |
|---|---|---|---|
| `status` | query | no | `confirmed` \| `cancelled` \| `completed` |

No request body.

### Response body `200`

```json
{
  "data": [
    {
      "id": "bkg_2001",
      "bookingNumber": "DM-20481",
      "serviceName": "Deep home cleaning",
      "status": "confirmed"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

Each item is a full **Booking** object.

### Status codes

| Status | When |
|---|---|
| `200` | Success, including zero bookings |
| `422` | Invalid `status` |
| `500` | Server failure |

### Validation errors

- `status`, if present, must be one of the documented values.

### Business errors

None.

### Loading / empty / error behaviour

| State | Contract | UI |
|---|---|---|
| Loading | Request in flight | List skeleton. |
| Empty | `200` + `data: []` | “No bookings yet” + link to the catalog. |
| Error | `422` / `500` | Error panel + retry. |

---

## `GET /api/v1/bookings/{booking_id}`

**Purpose:** Booking details and the post-submit confirmation screen.

### Request parameters

| Name | In | Required | Description |
|---|---|---|---|
| `booking_id` | path | yes | Booking id |

No request body.

### Response body `200`

```json
{
  "data": {
    "id": "bkg_2001",
    "bookingNumber": "DM-20481",
    "serviceId": "svc_1001",
    "serviceName": "Deep home cleaning",
    "providerName": "Northside Home Care",
    "customerId": "cus_01",
    "customerName": "Maya Chen",
    "addressId": "addr_01",
    "addressSummary": "Home — 18 Oak Street, Austin",
    "scheduledStart": "2026-09-15T10:00:00.000Z",
    "scheduledEnd": "2026-09-15T12:00:00.000Z",
    "status": "confirmed",
    "totalPrice": 8500,
    "currency": "USD",
    "createdAt": "2026-09-01T08:12:00.000Z"
  }
}
```

### Status codes

| Status | When |
|---|---|
| `200` | Booking found |
| `404` | Unknown `booking_id` |
| `500` | Server failure |

### Validation errors

None.

### Business errors

- `NOT_FOUND` if the booking does not exist.

### Loading / empty / error behaviour

| State | Contract | UI |
|---|---|---|
| Loading | Request in flight | Details skeleton. |
| Empty | Not used. Missing booking is `404`. | — |
| Error | `404` / `500` | Error panel. `404` offers a link back to My Bookings. |

---

## `GET /api/v1/customers`

**Purpose:** Customers and addresses for the booking step. Required so the UI does not hardcode people or addresses.

### Request parameters

None.

No request body.

### Response body `200`

```json
{
  "data": [
    {
      "id": "cus_01",
      "name": "Maya Chen",
      "email": "maya.chen@example.com",
      "addresses": [
        {
          "id": "addr_01",
          "label": "Home",
          "line1": "18 Oak Street",
          "city": "Austin",
          "postalCode": "78701"
        }
      ]
    }
  ]
}
```

### Status codes

| Status | When |
|---|---|
| `200` | Success, including zero customers |
| `500` | Server failure |

### Validation errors

None.

### Business errors

None. An address that does not belong to the selected customer is rejected later on `POST /bookings`.

### Loading / empty / error behaviour

| Status | Contract | UI |
|---|---|---|
| Loading | Request in flight | Disabled customer/address selectors. |
| Empty | `200` + `data: []` | Empty state: no customer profiles available. |
| Error | `500` | Error on the customer step + retry. |

---

## Cross-cutting client behaviour

### Loading

Every call may take several hundred milliseconds (mock) or longer (real network). Each screen has an explicit loading view. Mutations disable the submit control until the promise settles.

### Empty

Empty means **success with no rows**. It is not thrown as `ApiError`. Hooks distinguish:

- `status: 'empty'` when a collection is `[]`
- `status: 'error'` when the client throws

### Error

The HTTP client:

1. Parses the error envelope when the body is JSON
2. Throws `ApiError` with `status`, `code`, `message`, and optional `details`
3. If the body is not JSON, throws `ApiError` with `code: INTERNAL_ERROR`

Feature hooks never read `response.status` themselves.

### Demo scenarios (mock only)

The mock client may send `X-Mock-Scenario` so evaluators can force states without changing screens:

| Header value | Effect |
|---|---|
| `default` | Normal catalog and rules |
| `empty` | List endpoints return `[]` |
| `server-error` | Handlers return `500` |
| `conflict` | `POST /bookings` returns `409 SLOT_UNAVAILABLE` |
| `validation-error` | `POST /bookings` returns `422` with field details |

This header is a mock concern. A real backend ignores it.

---

## Replaceability

A real backend must:

- keep these paths, methods, and envelopes
- keep the same error codes
- accept the same booking body
- compute `scheduledEnd`, `bookingNumber`, and price server-side

The frontend then sets `VITE_API_MODE=http` and `VITE_API_BASE_URL`. Feature code does not change.
