import type { Customer } from '../../types/customer';
import { httpClient } from '../client/createHttpClient';

export function getCustomers(): Promise<Customer[]> {
  return httpClient.request<Customer[]>({
    method: 'GET',
    path: '/api/v1/customers',
  });
}
