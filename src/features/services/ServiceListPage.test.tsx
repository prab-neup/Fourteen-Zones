import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MockScenario, setMockScenario } from '../../api/mock';
import { ServiceListPage } from './ServiceListPage';

function renderList() {
  return render(
    <MemoryRouter>
      <ServiceListPage />
    </MemoryRouter>,
  );
}

describe('ServiceListPage', () => {
  it('renders catalog cards after a successful load', async () => {
    renderList();

    expect(await screen.findByRole('heading', { name: 'Deep home cleaning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Standard house cleaning' })).toBeInTheDocument();
    expect(screen.getAllByText('Northside Home Care').length).toBeGreaterThan(0);
  });

  it('shows an error state when the list API fails', async () => {
    setMockScenario(MockScenario.ServerError);
    renderList();

    expect(
      await screen.findByRole('heading', { name: 'Services could not be loaded' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
