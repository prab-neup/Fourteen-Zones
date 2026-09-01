import type { MockRequest, MockResult } from '../http';
import { ok, serverError } from '../http';
import { MockScenario } from '../scenario';
import { getStore } from '../store';

export function listCustomers(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  if (req.scenario === MockScenario.Empty) {
    return ok([]);
  }

  return ok(getStore().customers);
}
