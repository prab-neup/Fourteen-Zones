import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../../test/render';
import { ServiceDetailsPage } from './ServiceDetailsPage';

describe('ServiceDetailsPage', () => {
  it('shows the service fields from the API', async () => {
    renderWithRouter(
      <ServiceDetailsPage />,
      '/services/svc_1001',
      '/services/:serviceId',
    );

    expect(await screen.findByRole('heading', { name: 'Deep home cleaning' })).toBeInTheDocument();
    expect(screen.getByText('Northside Home Care')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book this service' })).toHaveAttribute(
      'href',
      '/services/svc_1001/book',
    );
  });

  it('shows an error when the service does not exist', async () => {
    renderWithRouter(
      <ServiceDetailsPage />,
      '/services/svc_missing',
      '/services/:serviceId',
    );

    expect(await screen.findByRole('heading', { name: 'Service not available' })).toBeInTheDocument();
  });
});
