import {
  MockScenario,
  getMockScenario,
  setMockScenario,
} from '../../api/mock';
import { useState } from 'react';

const OPTIONS: Array<{ value: (typeof MockScenario)[keyof typeof MockScenario]; label: string }> = [
  { value: MockScenario.Default, label: 'Default' },
  { value: MockScenario.Empty, label: 'Empty lists' },
  { value: MockScenario.ServerError, label: 'Server error' },
  { value: MockScenario.Conflict, label: 'Booking conflict' },
  { value: MockScenario.ValidationError, label: 'Validation error' },
];

/**
 * Demo-only control. Writes to the mock process store, not to React state,
 * so screens keep treating the API as a remote backend.
 */
export function ScenarioToolbar({ onChange }: { onChange?: () => void }) {
  const [scenario, setScenario] = useState(getMockScenario);

  return (
    <label className="scenario">
      Mock
      <select
        value={scenario}
        onChange={(event) => {
          const next = event.target.value as typeof scenario;
          setMockScenario(next);
          setScenario(next);
          onChange?.();
        }}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
