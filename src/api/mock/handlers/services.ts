import { ServiceCategory } from '../../../types/service';
import type { MockRequest, MockResult } from '../http';
import { notFound, ok, serverError, validationError } from '../http';
import { MockScenario } from '../scenario';
import { buildSlotsForDate, isValidDateOnly } from '../slots';
import { findService, getStore } from '../store';

const CATEGORY_VALUES = new Set<string>(Object.values(ServiceCategory));

function parsePage(raw: string | undefined, fallback: number): number | null {
  if (raw === undefined || raw === '') {
    return fallback;
  }

  if (!/^\d+$/.test(raw)) {
    return null;
  }

  return Number(raw);
}

export function listServices(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  const page = parsePage(req.query.page, 1);
  const pageSize = parsePage(req.query.pageSize, 12);

  if (page === null || page < 1) {
    return validationError([{ field: 'page', message: 'page must be an integer ≥ 1' }]);
  }

  if (pageSize === null || pageSize < 1 || pageSize > 50) {
    return validationError([
      { field: 'pageSize', message: 'pageSize must be an integer between 1 and 50' },
    ]);
  }

  if (req.scenario === MockScenario.Empty) {
    return ok([], { page, pageSize, total: 0 });
  }

  const query = (req.query.q ?? '').trim().toLowerCase();
  const category = req.query.category;

  let items = getStore().services;

  if (category) {
    // Unknown categories are a successful empty list, not a validation error.
    items = CATEGORY_VALUES.has(category)
      ? items.filter((service) => service.category === category)
      : [];
  }

  if (query) {
    items = items.filter((service) => {
      const haystack = [
        service.name,
        service.description,
        service.provider.name,
        service.category,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return ok(pageItems, { page, pageSize, total });
}

export function getServiceById(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  const service = findService(req.params.service_id);
  if (!service) {
    return notFound('Service not found.');
  }

  return ok(service);
}

export function getServiceAvailability(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  const service = findService(req.params.service_id);
  if (!service) {
    return notFound('Service not found.');
  }

  const date = req.query.date;
  if (!date) {
    return validationError([{ field: 'date', message: 'date is required' }]);
  }

  if (!isValidDateOnly(date)) {
    return validationError([
      { field: 'date', message: 'date must be a real calendar date (YYYY-MM-DD)' },
    ]);
  }

  if (req.scenario === MockScenario.Empty) {
    return ok({ serviceId: service.id, date, slots: [] });
  }

  return ok({
    serviceId: service.id,
    date,
    slots: buildSlotsForDate(service, date),
  });
}
