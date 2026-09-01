import { describe, expect, it } from 'vitest';
import { ApiError } from '../client';
import { MockScenario, setMockScenario } from '../mock';
import { getService, getServices } from './servicesApi';

describe('getServices', () => {
  it('returns the catalog on success', async () => {
    const result = await getServices();

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.meta.total).toBe(result.items.length);
    expect(result.items.some((service) => service.name === 'Deep home cleaning')).toBe(
      true,
    );
  });

  it('filters by search without treating misses as errors', async () => {
    const result = await getServices({ q: 'zzzz-no-match' });

    expect(result.items).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('throws a normalized server error', async () => {
    setMockScenario(MockScenario.ServerError);

    await expect(getServices()).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'INTERNAL_ERROR',
    });
    await expect(getServices()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('getService', () => {
  it('returns one service by id', async () => {
    const service = await getService('svc_1001');

    expect(service.id).toBe('svc_1001');
    expect(service.name).toBe('Deep home cleaning');
    expect(service.provider.name).toBe('Northside Home Care');
    expect(service.price).toBe(8500);
    expect(service.currency).toBe('USD');
  });

  it('throws NOT_FOUND for an unknown id', async () => {
    await expect(getService('svc_missing')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });
});
