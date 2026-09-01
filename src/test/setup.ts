import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  MockScenario,
  resetMockLatency,
  resetStore,
  setMockLatency,
  setMockScenario,
} from '../api/mock';

beforeEach(() => {
  setMockLatency(0);
  setMockScenario(MockScenario.Default);
  resetStore();
});

afterEach(() => {
  cleanup();
  resetMockLatency();
});
