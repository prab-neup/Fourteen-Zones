import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export function renderWithRouter(
  ui: ReactElement,
  path = '/',
  route = '/',
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={ui} />
      </Routes>
    </MemoryRouter>,
    options,
  );
}
