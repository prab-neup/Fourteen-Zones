export const MockScenario = {
  Default: 'default',
  Empty: 'empty',
  ServerError: 'server-error',
  Conflict: 'conflict',
  ValidationError: 'validation-error',
} as const;

export type MockScenario = (typeof MockScenario)[keyof typeof MockScenario];

/**
 * Process-wide mock switch. Kept out of React so handlers stay a fake backend.
 * The UI demo toolbar (later) writes this; the HTTP client sends it as a header.
 */
let currentScenario: MockScenario = MockScenario.Default;

export function getMockScenario(): MockScenario {
  return currentScenario;
}

export function setMockScenario(scenario: MockScenario): void {
  currentScenario = scenario;
}

export function isMockScenario(value: string): value is MockScenario {
  return Object.values(MockScenario).includes(value as MockScenario);
}
