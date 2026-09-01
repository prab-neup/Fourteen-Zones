import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { BookingPage } from './features/booking/BookingPage';
import { BookingDetailsPage } from './features/bookings/BookingDetailsPage';
import { ConfirmationPage } from './features/bookings/ConfirmationPage';
import { MyBookingsPage } from './features/bookings/MyBookingsPage';
import { ServiceDetailsPage } from './features/services/ServiceDetailsPage';
import { ServiceListPage } from './features/services/ServiceListPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ServiceListPage />} />
        <Route path="services/:serviceId" element={<ServiceDetailsPage />} />
        <Route path="services/:serviceId/book" element={<BookingPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/:bookingId/confirmed" element={<ConfirmationPage />} />
        <Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
