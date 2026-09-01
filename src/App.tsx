import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { BookingPage } from './features/booking/BookingPage';
import { MyBookingsPage } from './features/bookings/MyBookingsPage';
import { ServiceListPage } from './features/services/ServiceListPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ServiceListPage />} />
        <Route path="services/:serviceId/book" element={<BookingPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
