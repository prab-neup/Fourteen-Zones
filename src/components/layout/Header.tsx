import { NavLink } from 'react-router-dom';
import { ScenarioToolbar } from '../demo/ScenarioToolbar';

export function Header({ onScenarioChange }: { onScenarioChange?: () => void }) {
  return (
    <header className="header">
      <NavLink to="/" className="brand">
        <span className="brand-mark">Demo Marketplace</span>
        <span className="brand-tag">Trusted local services</span>
      </NavLink>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/" end>
          Services
        </NavLink>
        <NavLink to="/bookings">My Bookings</NavLink>
      </nav>
      <ScenarioToolbar onChange={onScenarioChange} />
    </header>
  );
}
