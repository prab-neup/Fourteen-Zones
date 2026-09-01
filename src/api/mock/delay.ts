const DEFAULT_LATENCY_MS = 450;

/**
 * Latency is configurable so the UI must handle loading, while tests can set 0.
 */
let latencyMs = readEnvLatency();

function readEnvLatency(): number {
  const raw = import.meta.env.VITE_MOCK_LATENCY_MS;
  if (!raw) {
    return DEFAULT_LATENCY_MS;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_LATENCY_MS;
}

export function getMockLatency(): number {
  return latencyMs;
}

export function setMockLatency(ms: number): void {
  latencyMs = Math.max(0, ms);
}

export function resetMockLatency(): void {
  latencyMs = readEnvLatency();
}

export function simulateLatency(): Promise<void> {
  if (latencyMs === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, latencyMs);
  });
}
