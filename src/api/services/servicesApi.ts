import type { ListMeta } from '../../types/api';
import type {
  Service,
  ServiceAvailabilityDay,
  ServiceCategory,
} from '../../types/service';
import { httpClient } from '../client/createHttpClient';

export type GetServicesParams = {
  q?: string;
  category?: ServiceCategory | string;
  page?: number;
  pageSize?: number;
};

export type ServiceListResult = {
  items: Service[];
  meta: ListMeta;
};

export type GetAvailabilityParams = {
  date: string;
};

export async function getServices(
  params: GetServicesParams = {},
): Promise<ServiceListResult> {
  const envelope = await httpClient.requestEnvelope<Service[], ListMeta>({
    method: 'GET',
    path: '/api/v1/services',
    query: {
      q: params.q,
      category: params.category,
      page: params.page,
      pageSize: params.pageSize,
    },
  });

  return {
    items: envelope.data,
    meta: envelope.meta ?? {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 12,
      total: envelope.data.length,
    },
  };
}

export function getService(serviceId: string): Promise<Service> {
  return httpClient.request<Service>({
    method: 'GET',
    path: `/api/v1/services/${serviceId}`,
  });
}

export function getServiceAvailability(
  serviceId: string,
  params: GetAvailabilityParams,
): Promise<ServiceAvailabilityDay> {
  return httpClient.request<ServiceAvailabilityDay>({
    method: 'GET',
    path: `/api/v1/services/${serviceId}/availability`,
    query: { date: params.date },
  });
}
