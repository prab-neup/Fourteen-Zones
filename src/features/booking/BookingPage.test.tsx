import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../../test/render';
import { BookingPage } from './BookingPage';

function renderBooking() {
  return renderWithRouter(
    <BookingPage />,
    '/services/svc_1001/book',
    '/services/:serviceId/book',
  );
}

describe('BookingPage', () => {
  it('shows a validation message when continuing without a time slot', async () => {
    const user = userEvent.setup();
    renderBooking();

    expect(await screen.findByRole('heading', { name: 'Schedule your visit' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Choose an available time slot.');
  });
});
