import type { MockRequest, MockResult } from './http';
import { fail } from './http';
import { ErrorCode } from '../../types/api';
import { createBooking, getBookingById, listBookings } from './handlers/bookings';
import { listCustomers } from './handlers/customers';
import {
  getServiceAvailability,
  getServiceById,
  listServices,
} from './handlers/services';

type Route = {
  method: MockRequest['method'];
  pattern: RegExp;
  paramNames: string[];
  handler: (req: MockRequest) => MockResult;
};

/**
 * Availability is registered before `/:service_id` so the path does not
 * treat "availability" as an id.
 */
const routes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/api\/v1\/services$/,
    paramNames: [],
    handler: listServices,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/services\/([^/]+)\/availability$/,
    paramNames: ['service_id'],
    handler: getServiceAvailability,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/services\/([^/]+)$/,
    paramNames: ['service_id'],
    handler: getServiceById,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/bookings$/,
    paramNames: [],
    handler: listBookings,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/bookings\/([^/]+)$/,
    paramNames: ['booking_id'],
    handler: getBookingById,
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/bookings$/,
    paramNames: [],
    handler: createBooking,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/customers$/,
    paramNames: [],
    handler: listCustomers,
  },
];

export function routeMockRequest(req: Omit<MockRequest, 'params'>): MockResult {
  for (const route of routes) {
    if (route.method !== req.method) {
      continue;
    }

    const match = req.path.match(route.pattern);
    if (!match) {
      continue;
    }

    const params: Record<string, string> = {};
    route.paramNames.forEach((name, index) => {
      params[name] = decodeURIComponent(match[index + 1]);
    });

    return route.handler({ ...req, params });
  }

  return fail(404, ErrorCode.NotFound, `No mock handler for ${req.method} ${req.path}`);
}
